import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Props:
 *  - chart: { labels: [..years..], price: [..numbers..], demand: [..numbers..] }
 */
export default function ChartPanel({ chart }) {
  if (!chart || !chart.labels || chart.labels.length === 0) {
    return <div className="text-muted">No chart data available.</div>;
  }

  const data = {
    labels: chart.labels,
    datasets: [
      {
        label: "Average Price",
        data: chart.price || [],
        fill: false,
        tension: 0.3,
        yAxisID: "y",
        pointRadius: 3
      },
      {
        label: "Demand",
        data: chart.demand || [],
        fill: false,
        tension: 0.3,
        yAxisID: "y1",
        pointRadius: 3
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "top" },
      title: { display: false }
    },
    scales: {
      x: {
        display: true,
        title: { display: true, text: "Year" }
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: { display: true, text: "Average Price" }
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        grid: { drawOnChartArea: false },
        title: { display: true, text: "Demand" }
      }
    }
  };

  return (
    <div style={{ height: 320 }}>
      <Line options={options} data={data} />
    </div>
  );
}
