import React, { useState } from "react";
import { FourSquare } from "react-loading-indicators";

function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  // Decode JWT and get userId
 // Helper to decode JWT and get userId
const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    console.log("Decoded JWT payload:", payload); // ✅ debug log
    return payload.userId;
  } catch (err) {
    console.error("Error decoding token:", err);
    return null;
  }
};



  const handleUpload = async () => {
    if (!file) return setError("Please select a file first!");

    const userId = getUserIdFromToken();
    if (!userId) return setError("User not logged in or token missing!");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("userId", userId); // ✅ send userId

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const res = await fetch("http://localhost:5000/upload/resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        console.log("Skills stored:", data.skills);
        setSuccess(true);
      } else {
        setError(data.error || "Upload failed. Try again.");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ResumeUpload">
      <h2>Upload Resume</h2>
      <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload Resume</button>

      {loading && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          backgroundColor: "rgba(255, 255, 255, 0.6)", backdropFilter: "blur(5px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
        }}>
          <FourSquare color="#44a4c0" size="medium" text="" textColor="" />
        </div>
      )}

      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
      {success && <p style={{ color: "green", marginTop: "1rem", fontWeight: "bold" }}>
        Resume Uploaded Successfully
      </p>}
    </div>
  );
}

export default ResumeUpload;
