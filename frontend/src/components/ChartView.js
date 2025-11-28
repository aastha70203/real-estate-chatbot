import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function ChartView({ labels = [], price = [], demand = [] }) {
  const data = useMemo(() => {
    return {
      labels,
      datasets: [
        {
          label: "Price",
          data: price,
          yAxisID: "y",
          tension: 0.25,
          borderColor: "rgb(45,106,79)",        // forest green
          backgroundColor: "rgba(45,106,79,0.12)",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: "Demand",
          data: demand,
          yAxisID: "y1",
          tension: 0.25,
          borderColor: "rgb(127,85,57)",        // warm brown
          backgroundColor: "rgba(127,85,57,0.08)",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [labels, price, demand]);

  const options = useMemo(() => ({
    responsive: true,
    interaction: { mode: "index", intersect: false },
    stacked: false,
    plugins: {
      legend: { position: "top" },
      title: { display: false },
    },
    scales: {
      x: {
        grid: { color: "#f1efe9" },
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        ticks: { callback: (v) => v },
        grid: { color: "#f8f6f2" },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        grid: { drawOnChartArea: false },
      },
    },
  }), []);

  return <div style={{ padding: 8 }}><Line options={options} data={data} /></div>;
}
