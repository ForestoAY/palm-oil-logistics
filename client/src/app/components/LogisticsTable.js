"use client";

export default function LogisticsTable({ logistics = [] }) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            No. DO Kecil
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Tgl DO Kecil
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Nama Sopir
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Muat
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Bongkar
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Susut
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Toleransi
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Susut diatas toleransi
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Denda Susut Sopir
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Kontribusi tdk susut
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Kontribusi Bonus
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Bonus antar teman
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            isKenaDenda
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {logistics.map((item, index) => (
          <tr key={index}>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.do_kecil || "-"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.tanggal_do_kecil
                ? new Date(item.tanggal_do_kecil).toLocaleDateString()
                : "-"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.driver || "-"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.netto_muat || "-"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.netto_bongkar || "-"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">{item.susut || "-"}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.batas_toleransi || "-"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.susut_diatas_toleransi || "-"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.denda_susut_sopir || "-"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.kontribusi_tdk_susut || "-"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.kontribusi_bonus || "-"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.bonus_antar_teman || "-"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.isKenaDenda || "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
