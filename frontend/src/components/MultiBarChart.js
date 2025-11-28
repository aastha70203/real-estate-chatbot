// src/components/MultiBarChart.js
import React from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";

/**
 * props:
 *  - labels: x-axis labels (locations or categories)
 *  - series: array[{ label, data, backgroundColor }]
 */
export default function MultiBarChart({ labels, series, height = 320 }) {
  const data = {
    labels: labels || [],
    datasets: (series || []).map((s) => ({
      label: s.label,
      data: s.data || [],
      backgroundColor: s.backgroundColor,
      borderWidth: 1,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" }, title: { display: false } },
    scales: {
      x: { stacked: false },
      y: { stacked: false, beginAtZero: true },
    },
  };

  return <div style={{ height }}><Bar data={data} options={options} /></div>;
}

MultiBarChart.propTypes = {
  labels: PropTypes.array,
  series: PropTypes.array,
  height: PropTypes.number,
};
