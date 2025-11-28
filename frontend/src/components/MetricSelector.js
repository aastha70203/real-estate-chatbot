// src/components/MetricSelector.js
import React from "react";
import PropTypes from "prop-types";

/**
 * Props:
 * - numericColumns: array of { key, label }
 * - onChange: ({ selectedMetrics: [keys], chartType, aggregateBy }) => void
 * - value: { selectedMetrics: [], chartType: "multi-line"|"multi-bar"|"geo", aggregateBy: "year"|"total" }
 */
export default function MetricSelector({ numericColumns = [], value = {}, onChange }) {
  const { selectedMetrics = [], chartType = "multi-line", aggregateBy = "year" } = value || {};

  const toggleMetric = (key) => {
    const idx = selectedMetrics.indexOf(key);
    const next = idx === -1 ? [...selectedMetrics, key] : selectedMetrics.filter((k) => k !== key);
    onChange({ selectedMetrics: next, chartType, aggregateBy });
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <h6>Select metrics to plot</h6>
        <div className="mb-2">
          {numericColumns.length === 0 && <div className="text-muted">No numeric columns detected.</div>}
          {numericColumns.map((c) => (
            <div key={c.key} className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="checkbox"
                id={`m-${c.key}`}
                checked={selectedMetrics.includes(c.key)}
                onChange={() => toggleMetric(c.key)}
              />
              <label className="form-check-label" htmlFor={`m-${c.key}`}>{c.label || c.key}</label>
            </div>
          ))}
        </div>

        <div className="mb-2">
          <label className="form-label me-2">Chart type:</label>
          <div className="btn-group" role="group">
            <button type="button" className={`btn btn-sm ${chartType === "multi-line" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => onChange({ selectedMetrics, chartType: "multi-line", aggregateBy })}>Multi-line</button>
            <button type="button" className={`btn btn-sm ${chartType === "multi-bar" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => onChange({ selectedMetrics, chartType: "multi-bar", aggregateBy })}>Multi-bar</button>
            <button type="button" className={`btn btn-sm ${chartType === "geo" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => onChange({ selectedMetrics, chartType: "geo", aggregateBy })}>Geo-scatter</button>
          </div>
        </div>

        <div>
          <label className="form-label me-2">Aggregate by:</label>
          <select value={aggregateBy} onChange={(e) => onChange({ selectedMetrics, chartType, aggregateBy: e.target.value })} className="form-select form-select-sm" style={{ width: 160, display: "inline-block" }}>
            <option value="year">year</option>
            <option value="total">total (per location)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

MetricSelector.propTypes = {
  numericColumns: PropTypes.array,
  value: PropTypes.object,
  onChange: PropTypes.func,
};
