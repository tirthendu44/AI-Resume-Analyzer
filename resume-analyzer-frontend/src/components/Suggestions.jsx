import React, { useEffect, useState } from "react";

// Use environment variable for API base
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const Suggestions = ({ userId, jobId, refreshKey }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);   // ✅ track errors
  const [loading, setLoading] = useState(false); // ✅ track loading state

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Decide which backend route to call
        const url = jobId
          ? `${API_BASE}/score/job-suggestions/${userId}/${jobId}`
          : `${API_BASE}/score/resume-suggestions/${userId}`;

        const res = await fetch(url);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setError("Failed to load suggestions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchSuggestions();
  }, [userId, jobId, refreshKey]);

  return (
    <div style={styles.outer}>
      {loading && <p>Loading suggestions...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <ul style={styles.list}>
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              style={{
                ...styles.item,
                animation: "fadeIn 1s forwards",
                animationDelay: `${idx * 0.3}s`
              }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  outer: {
    background: "#f0f4f8",
    borderRadius: "8px",
    padding: "16px",
    width: "100%",
    flex: 1,          // ✅ stretch to fill parent card
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column"
  },
  list: {
    paddingLeft: "20px",
    margin: 0,
    flex: 1           // ✅ list stretches inside outer
  },
  item: {
    marginBottom: "8px",
    color: "#555",
    opacity: 0
  }
};

export default Suggestions;
