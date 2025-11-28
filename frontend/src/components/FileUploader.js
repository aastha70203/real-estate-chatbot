// frontend/src/components/FileUploader.js
import React, { useState } from "react";
import axios from "axios";

export default function FileUploader({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const onChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const onUpload = async () => {
    if (!file) {
      setMessage("Please choose a file first.");
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await axios.post("http://localhost:8000/api/upload/", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage("Upload successful.");
      if (onUploaded) onUploaded(res.data);
    } catch (err) {
      console.error("Upload error", err);
      setMessage("Upload failed: " + (err.response?.data?.error || err.message));
    }
  };

  const onClear = () => {
    setFile(null);
    setMessage("");
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5>Upload dataset (Excel / CSV)</h5>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={onChange} />
        <div className="mt-2">
          <button className="btn btn-primary me-2" onClick={onUpload}>Upload file</button>
          <button className="btn btn-outline-secondary" onClick={onClear}>Clear</button>
        </div>
        {message && <div className="mt-2 text-success">{message}</div>}
      </div>
    </div>
  );
}
