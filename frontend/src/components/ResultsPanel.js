import React, { useMemo } from "react";
import ChartView from "./ChartView";

export default function ResultsPanel({ result, errorMsg, onReRun, filePath, query }) {
  // Prepare data for chart only when result present
  const chartData = useMemo(() => {
    if (!result || !result.chart) return null;
    return {
      labels: result.chart.labels || [],
      price: result.chart.price || [],
      demand: result.chart.demand || [],
      price_col: result.chart.price_col,
      demand_col: result.chart.demand_col,
    };
  }, [result]);

  const tableRows = useMemo(() => {
    if (!result || !result.table) return [];
    return result.table;
  }, [result]);

  return (
    <div>
      {errorMsg && (
        <div className="card error-card">
          <strong>Request failed</strong>
          <div className="muted" style={{ marginTop: 8 }}>{errorMsg}</div>
        </div>
      )}

      {!errorMsg && !result && (
        <div className="card">
          <h3 className="card-title">No results yet</h3>
          <div className="muted">Upload a file or run an analysis to see charts and tables.</div>
        </div>
      )}

      {result && (
        <div className="card">
          <h3 className="card-title">Summary</h3>
          <pre className="summary-block">{result.summary}</pre>

          <div className="summary-actions">
            <a
              className="btn btn-outline"
              href={`/api/download/?query=${encodeURIComponent(query || "")}${filePath ? `&file=${encodeURIComponent(filePath)}` : ""}`}
            >
              Download filtered CSV
            </a>
            <button className="btn btn-ghost" onClick={() => { console.log(result); alert("Logged raw result to console."); }}>
              Debug: log raw result
            </button>
          </div>
        </div>
      )}

      {chartData && (
        <div className="card">
          <h3 className="card-title">Price trend (Line)</h3>
          <ChartView labels={chartData.labels} price={chartData.price} demand={chartData.demand} />
        </div>
      )}

      {tableRows && tableRows.length > 0 && (
        <div className="card">
          <h3 className="card-title">Filtered rows ({tableRows.length})</h3>
          <div className="table-wrap">
            <table className="results-table">
              <thead>
                <tr>
                  {Object.keys(tableRows[0]).slice(0, 8).map((h) => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(0, 25).map((r, idx) => (
                  <tr key={idx}>
                    {Object.keys(tableRows[0]).slice(0, 8).map((k) => <td key={k}>{String(r[k] ?? "")}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            {tableRows.length > 25 && <div className="muted">Showing first 25 rows.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
