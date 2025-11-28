// src/components/MultiSeriesLine.js
import React from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";

/**
 * props:
 *  - labels: array[string] (x-axis labels)
 *  - series: array[{ label, data, yAxisID?, borderColor?, backgroundColor? }]
 *  - options: extra Chart.js options
 */
export default function MultiSeriesLine({ labels, series, options = {}, height = 320 }) {
  const data = {
    labels: labels || [],
    datasets: (series || []).map((s, i) => ({
      label: s.label,
      data: s.data || [],
      borderWidth: 2,
      tension: 0.25,
      fill: false,
      borderColor: s.borderColor,
      backgroundColor: s.backgroundColor,
      yAxisID: s.yAxisID || "y",
      pointRadius: 3,
    })),
  };

  const opts = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    stacked: false,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
      title: { display: !!options.title, text: options.title || "" },
    },
    scales: {
      x: { title: { display: true, text: options.xLabel || "Period" } },
      y: { type: "linear", display: true, position: "left", title: { display: !!options.yLabel, text: options.yLabel } },
      y1: { type: "linear", display: !!options.includeRightAxis, position: "right", grid: { drawOnChartArea: false }, title: { display: !!options.y1Label, text: options.y1Label } },
    },
    ...options,
  };

  return <div style={{ height }}><Line data={data} options={opts} /></div>;
}

MultiSeriesLine.propTypes = {
  labels: PropTypes.array,
  series: PropTypes.array,
  options: PropTypes.object,
  height: PropTypes.number,
};
