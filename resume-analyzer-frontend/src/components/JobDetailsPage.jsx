import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Pie from "./Pie";
import { FourSquare } from "react-loading-indicators";

// Use environment variable for API base
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function JobDetailsPage({ userId }) {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [score, setScore] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !jobId) return;

    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/jobs/analysis/${userId}/${jobId}`)
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
      {/* Loading overlay */}
      {loading && (
        <div className="loading-overlay">
          <FourSquare color="#44a4c0" size="medium" text="" textColor="" />
        </div>
      )}

      {/* Error message */}
      {error && <p className="error-message">{error}</p>}

      {!job && !loading && !error && <p>Loading job details...</p>}

      {job && (
        <div className="job-details-layout">
          {/* Left column: Pie + Suggestions */}
          <div className="left-column">
            <div className="card pie-card">
              <h2 className="card-title">Match Strength</h2>
              <div className="center-content">
                <Pie percentage={score} colour="#4CAF50" />
              </div>
              {matchedSkills.length > 0 && (
                <p>
                  <strong>Matched Skills:</strong> {matchedSkills.join(", ")}
                </p>
              )}
            </div>

            <div className="card suggestions-card">
              <h2 className="card-title">Required Improvements</h2>
              <ul>
                {suggestions.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right column: Job details */}
          <div className="right-column">
            <div className="card">
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
