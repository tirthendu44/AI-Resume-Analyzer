import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Pie from "./Pie";
import { FourSquare } from "react-loading-indicators"; // ✅ import spinner

function JobDetailsPage({ userId }) {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [score, setScore] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [loading, setLoading] = useState(false);   // ✅ new state
  const [error, setError] = useState(null);        // ✅ new state

  useEffect(() => {
    if (!userId || !jobId) return;

    setLoading(true);
    setError(null);

    fetch(`http://localhost:5000/jobs/analysis/${userId}/${jobId}`)
      .then((res) => res.json())
      .then((data) => {
        setJob(data.job);
        setScore(data.score || 0);
        setSuggestions(data.suggestions || []);
        setMatchedSkills(data.matchedSkills || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching job analysis:", err);
        setError("Failed to load job details. Please try again.");
        setLoading(false);
        setScore(0);
        setJob(null);
        setSuggestions([]);
        setMatchedSkills([]);
      });
  }, [jobId, userId]);

  return (
    <div>
      {/* ✅ Loading overlay */}
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <FourSquare color="#44a4c0" size="medium" text="" textColor="" />
        </div>
      )}

      {/* ✅ Error message */}
      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

      {!job && !loading && !error && <p>Loading job details...</p>}

      {job && (
        <div className="job-details-layout" style={{ display: "flex", gap: "20px" }}>
          {/* Left column: Pie + Suggestions */}
          <div
            className="left-column"
            style={{ width: "35%", display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div className="card pie-card" style={{ flex: "0 0 auto" }}>
              <h2 className="card-title">Match Strength</h2>
              <div className="center-content">
                <Pie percentage={score} colour="#4CAF50" />
              </div>
              {matchedSkills.length > 0 && (
                <p style={{ marginTop: "10px" }}>
                  <strong>Matched Skills:</strong> {matchedSkills.join(", ")}
                </p>
              )}
            </div>

            <div
              className="card suggestions-card"
              style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
            >
              <h2 className="card-title">Required Improvements</h2>
              <ul style={{ paddingLeft: "20px", margin: 0 }}>
                {suggestions.map((s, idx) => (
                  <li key={idx} style={{ marginBottom: "8px", color: "#555" }}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right column: Job details */}
          <div
            className="right-column"
            style={{ width: "65%", display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div className="card" style={{ flex: "0 0 auto" }}>
              <h2 className="card-title">{job.title}</h2>
              <p><strong>Company:</strong> {job.company}</p>
              <p><strong>Description:</strong> {job.description}</p>
              <p><strong>Domain:</strong> {job.domain}</p>
              <p><strong>Required Skills:</strong> {job.required_skills?.join(", ")}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobDetailsPage;
