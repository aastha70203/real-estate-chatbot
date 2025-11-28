// src/components/ChartCard.js
import React from "react";
import PropTypes from "prop-types";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Scatter } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

export default function ChartCard({ title, children, height = 320 }) {
  return (
    <div className="card mb-3">
      {title && <div className="card-header">{title}</div>}
      <div className="card-body" style={{ height, minHeight: 160 }}>
        {children}
      </div>
    </div>
  );
}

ChartCard.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  height: PropTypes.number,
};
