// src/components/ScatterGeoChart.js
import React from "react";
import PropTypes from "prop-types";
import { Scatter } from "react-chartjs-2";

/**
 * props:
 *  - points: [{ x: lng, y: lat, r (size), label, color }]
 *  - title
 */
export default function ScatterGeoChart({ points = [], title = "Geo scatter", height = 320 }) {
  // Chart.js scatter uses x/y numeric values
  const data = {
    datasets: [
      {
        label: title,
        data: (points || []).map((p) => ({ x: p.x, y: p.y, r: p.r || 6 })),
        backgroundColor: (points || []).map((p) => p.color || "rgba(255,99,132,0.6)"),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => {
      const i = ctx.dataIndex;
      const p = points[i] || {};
      return `${p.label || ""} (${p.y}, ${p.x}) : ${p.value ?? ""}`;
    } } } },
    scales: {
      x: { title: { display: true, text: "Longitude" } },
      y: { title: { display: true, text: "Latitude" } },
    },
  };

  return <div style={{ height }}><Scatter data={data} options={options} /></div>;
}

ScatterGeoChart.propTypes = {
  points: PropTypes.array,
  title: PropTypes.string,
  height: PropTypes.number,
};
