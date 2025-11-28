import React from "react";

export default function QueryBar({ query, onChange, onAnalyze, loading, useLLM, onToggleLLM }) {
  return (
    <section className="card query-card">
      <div className="query-row">
        <input
          className="query-input"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., Show price growth for Akurdi over the last 3 years"
        />
        <button className="btn btn-primary" onClick={onAnalyze} disabled={loading}>
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </div>
      <div className="options-row">
        <label className="switch">
          <input type="checkbox" checked={useLLM} onChange={onToggleLLM} />
          <span className="switch-slider" />
        </label>
        <span className="muted">Use LLM summary (OpenAI)</span>
      </div>
    </section>
  );
}
