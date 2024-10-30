"use client";

import { useEffect, useState } from "react";
import LogisticsTable from "./components/LogisticsTable";

export default function Logistics() {
  const [logistics, setLogistics] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogisticsData = async () => {
    const response = await fetch(
      "https://palm-oil-server.vercel.app/api/logistics"
    );

    // Check if the response is OK (status in the range 200-299)
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json(); // Parse the JSON data
    console.log(data, "<<< res");

    setLogistics(data);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        await fetchLogisticsData();
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <LogisticsTable logistics={logistics} />
    </div>
  );
}
