import Cors from "cors";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Initialize the CORS middleware
const cors = Cors({
  methods: ["GET", "HEAD"],
});

// Helper function to run the middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Constants
const denda_per_kg = 20000; // Rp 20,000/kg
const commodity_price = 10000; // Rp 10,000/kg
const cut_off_date_start = new Date("2024-08-05");
const cut_off_date_end = new Date("2024-09-05");

export default async function handler(req, res) {
  // Run the CORS middleware
  await runMiddleware(req, res, cors);

  // Ensure only GET requests are allowed
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const result = await pool.query(
      `SELECT 
                "bkm_sites"."nama" AS site,
                "bkm_do_kecil_header"."no_do_kecil" AS "do_kecil",
                "bkm_do_kecil_header"."id" AS "do_kecil_id",
                "bkm_do_kecil_header"."createdAt" AS "tanggal_do_kecil",
                "bkm_do_besar"."no_do_besar" AS "do_besar",
                "bkm_do_besar"."id" AS "do_besar_id",
                "bkm_komoditi"."nama_komoditi" AS "komoditi",
                "bkm_do_kecil_header"."no_spb",
                "bkm_user_karyawan"."nama" AS "driver",
                "bkm_kendaraan"."no_polisi" AS "nopol",
                "bkm_tipe_kendaraan"."tipe" AS "tipe_kendaraan",
                "bkm_customer_pks"."kode" AS "PKS",
                "bkm_tujuan_bongkar"."kode" AS "tujuan",
                "bkm_do_kecil_header"."tgl_muat" AS "tanggal_muat",
                "bkm_do_kecil_header"."bruto_muat",
                "bkm_do_kecil_header"."tarra_muat",
                "bkm_do_kecil_detail"."muat" AS "netto_muat",
                "bkm_do_kecil_header"."tgl_bongkar" AS "tanggal_bongkar",
                "bkm_do_kecil_header"."bruto_bongkar",
                "bkm_do_kecil_header"."tarra_bongkar",
                "bkm_do_kecil_detail"."bongkar" AS "netto_bongkar", 
                "bkm_do_kecil_detail"."bongkar" - "bkm_do_kecil_detail"."muat" AS "susut",
                "bkm_ongkos_angkut"."ongkos_angkut",
                "bkm_do_kecil_detail"."muat" * "bkm_ongkos_angkut"."ongkos_angkut" AS "value_muat",
                "bkm_do_kecil_detail"."bongkar" * "bkm_ongkos_angkut"."ongkos_angkut" AS "value_bongkar",
                "bkm_do_kecil_header"."status",
                "bkm_do_kecil_header"."isKenaDenda" AS "do_kecil_isKenaDenda"
            FROM bkm_do_kecil_header 
            LEFT JOIN "bkm_do_kecil_detail" ON "bkm_do_kecil_detail"."headerId" = "bkm_do_kecil_header"."id" 
            LEFT JOIN "bkm_do_besar" ON "bkm_do_besar"."id" = "bkm_do_kecil_detail"."dOBesarId" 
            LEFT JOIN "bkm_customer_pks" ON "bkm_customer_pks"."id" = "bkm_do_besar"."customerPKSId" 
            LEFT JOIN "bkm_komoditi" ON "bkm_komoditi"."id" = "bkm_do_besar"."komoditiId"
            LEFT JOIN "bkm_ongkos_angkut" ON "bkm_ongkos_angkut"."id" = "bkm_do_kecil_detail"."ongkosAngkutId"
            LEFT JOIN "bkm_kendaraan" ON "bkm_kendaraan"."id" = "bkm_do_kecil_header"."kendaraanId"
            LEFT JOIN "bkm_tipe_kendaraan" ON "bkm_tipe_kendaraan"."id" = "bkm_kendaraan"."tipeKendaraanId"
            LEFT JOIN "bkm_assign_driver_kendaraan" ON "bkm_assign_driver_kendaraan"."kendaraanId" = "bkm_do_kecil_header"."kendaraanId"
            LEFT JOIN "bkm_user_karyawan" ON "bkm_user_karyawan"."id" = "bkm_assign_driver_kendaraan"."karyawanId"
            LEFT JOIN "bkm_tujuan_bongkar" ON "bkm_tujuan_bongkar"."id" = "bkm_do_besar"."tujuanBongkarId"
            LEFT JOIN "bkm_sites" ON "bkm_sites"."id" = "bkm_customer_pks"."businessSiteId"
            WHERE "bkm_do_kecil_header"."status" NOT IN ('DELETIONAPPROVAL', 'DELETED', 'DECLINED', 'REJECTIONAPPROVAL', 'REJECTED')
              AND "bkm_do_kecil_header"."tgl_bongkar" BETWEEN $1 AND $2
        `,
      [cut_off_date_start, cut_off_date_end]
    );

    const data = result.rows.map((row) => {
      const netto_muat = row.netto_muat;
      const netto_bongkar = row.netto_bongkar;
      const susut = netto_bongkar - netto_muat;

      // Calculate batas_toleransi
      const batas_toleransi = Math.ceil((0.0025 * netto_muat) / 10) * 10 * -1;

      // Calculate denda_susut
      const isKenaDenda = row.do_kecil_isKenaDenda;
      let denda_susut = 0;

      if (isKenaDenda) {
        const penalty = denda_per_kg * (susut - batas_toleransi) * -1;
        denda_susut = Math.max(penalty, 0);
      }

      // Calculate kontribusi_tidak_susut
      const kontribusi_tidak_susut = Math.max(susut - batas_toleransi, 0);

      return {
        ...row,
        susut,
        batas_toleransi,
        denda_susut,
        kontribusi_tidak_susut,
      };
    });

    // Group data by do_besar_id for further calculations
    const do_besar_map = new Map();

    data.forEach((item) => {
      const do_besar_id = item.do_besar_id;
      if (!do_besar_map.has(do_besar_id)) {
        do_besar_map.set(do_besar_id, {
          total_kontribusi_tidak_susut: 0,
          total_denda_susut: 0,
          entries: [],
        });
      }
      const entry = do_besar_map.get(do_besar_id);
      entry.total_kontribusi_tidak_susut += item.kontribusi_tidak_susut;
      entry.total_denda_susut += item.denda_susut;
      entry.entries.push(item);
    });

    // Calculate bonus_contribution and total_bonus for each do_besar_id
    const finalResults = [];

    do_besar_map.forEach((value, key) => {
      const total_kontribusi_tidak_susut = value.total_kontribusi_tidak_susut;
      const total_denda_susut = value.total_denda_susut;

      value.entries.forEach((entry) => {
        const bonus_contribution =
          total_kontribusi_tidak_susut > 0
            ? entry.kontribusi_tidak_susut / total_kontribusi_tidak_susut
            : 0;
        const denda_fr = total_kontribusi_tidak_susut * commodity_price * 3;
        const total_bonus = total_denda_susut - denda_fr;

        finalResults.push({
          ...entry,
          bonus_contribution,
          denda_fr,
          total_bonus,
          bonus_antar_teman: bonus_contribution * total_bonus,
        });
      });
    });

    // Filter out unnecessary columns
    const resultToSend = finalResults.map(
      ({
        no_spb,
        nopol,
        tipe_kendaraan,
        tujuan,
        bruto_muat,
        tarra_muat,
        bruto_bongkar,
        tarra_bongkar,
        ongkos_angkut,
        status,
        ...rest
      }) => rest
    );

    res.json(resultToSend);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
