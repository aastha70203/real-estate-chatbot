import React, { useState, useEffect } from "react";
import NavBar from "./components/NavBar";
import UploadPanel from "./components/UploadPanel";
import QueryBar from "./components/QueryBar";
import ResultsPanel from "./components/ResultsPanel";

function App() {
  const [filePath, setFilePath] = useState(null); // path returned by upload endpoint
  const [query, setQuery] = useState("");
  const [useLLM, setUseLLM] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // helper to call analyze endpoint
  const runAnalysis = async (q = query) => {
    setErrorMsg("");
    setLoading(true);
    setResult(null);
    try {
      const params = new URLSearchParams();
      params.append("query", q || "");
      params.append("top", "200");
      params.append("use_llm", useLLM ? "true" : "false");
      if (filePath) params.append("file", filePath);

      const resp = await fetch(`/api/analyze/?${params.toString()}`, {
        headers: {
          Accept: "application/json",
        },
      });

      // if server returned HTML (error page),this captures it
      const contentType = resp.headers.get("content-type") || "";
      if (!resp.ok) {
        // Try parse JSON error
        if (contentType.includes("application/json")) {
          const j = await resp.json();
          setErrorMsg(j.error || JSON.stringify(j));
        } else {
          const t = await resp.text();
          setErrorMsg(`Server error (non-JSON): ${t.slice(0, 400)}`);
        }
        setLoading(false);
        return;
      }

      if (!contentType.includes("application/json")) {
        const t = await resp.text();
        setErrorMsg(`Server did not return JSON: ${t.slice(0, 300)}`);
        setLoading(false);
        return;
      }

      const data = await resp.json();
      setResult(data);
    } catch (e) {
      setErrorMsg(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  // when filePath changes, re-runs last query (if present)
  useEffect(() => {
    if (filePath && query) {
      // small debounce to allow upload UI settle
      const t = setTimeout(() => runAnalysis(query), 250);
      return () => clearTimeout(t);
    }
    
  }, [filePath]);

  return (
    <div className="app-root">
      <NavBar />
      <main className="container">
        <UploadPanel
          onUpload={(path) => {
            setFilePath(path);
          }}
        />

        <QueryBar
          query={query}
          onChange={setQuery}
          onAnalyze={() => runAnalysis()}
          loading={loading}
          useLLM={useLLM}
          onToggleLLM={() => setUseLLM((s) => !s)}
        />

        <div style={{ marginTop: 18 }}>
          <ResultsPanel
            result={result}
            errorMsg={errorMsg}
            onReRun={() => runAnalysis()}
            filePath={filePath}
            query={query}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
