import React, { useState } from "react";

export default function UploadPanel({ onUpload }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(""); // "", "uploading", "success", error msg

  const handleFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setStatus("");
  };

  const upload = async () => {
    if (!file) {
      setStatus("Please choose a file first.");
      return;
    }
    setStatus("uploading");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const resp = await fetch("/api/upload/", {
        method: "POST",
        body: fd,
      });
      const contentType = resp.headers.get("content-type") || "";
      if (!resp.ok) {
        let t = await resp.text();
        setStatus(`Upload failed: ${t}`);
        return;
      }
      if (contentType.includes("application/json")) {
        const j = await resp.json();
        if (j.path) {
          setStatus("Upload successful.");
          onUpload(j.path);
        } else {
          setStatus("Upload succeeded (no path returned).");
        }
      } else {
        const t = await resp.text();
        setStatus(`Upload response (non-json): ${t.slice(0,200)}`);
      }
    } catch (err) {
      setStatus(err.message || String(err));
    }
  };

  const clear = () => {
    setFile(null);
    setStatus("");
    onUpload(null);
    document.getElementById("file-input")?.value && (document.getElementById("file-input").value = "");
  };

  return (
    <section className="card upload-card">
      <h2 className="card-title">Upload dataset (Excel / CSV)</h2>
      <div className="upload-row">
        <input id="file-input" type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} />
        <div className="upload-actions">
          <button className="btn btn-primary" onClick={upload}>Upload file</button>
          <button className="btn btn-ghost" onClick={clear}>Clear</button>
        </div>
      </div>
      <div className="upload-note">
        {file ? <span className="muted">Selected: {file.name}</span> : <span className="muted">No file chosen</span>}
      </div>
      <div style={{ marginTop: 10 }}>
        {status === "uploading" && <div className="muted">Uploading…</div>}
        {status && status !== "uploading" && (
          <div className={status.startsWith("Upload successful") || status === "Upload successful." ? "text-success" : "text-error"}>
            {status}
          </div>
        )}
      </div>
    </section>
  );
}
