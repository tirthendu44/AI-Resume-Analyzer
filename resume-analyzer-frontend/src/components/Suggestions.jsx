import React, { useEffect, useState } from "react";

const Suggestions = ({ userId, jobId, refreshKey }) => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        // ✅ Decide which backend route to call
        const url = jobId
          ? `http://localhost:5000/score/job-suggestions/${userId}/${jobId}`
          : `http://localhost:5000/score/resume-suggestions/${userId}`;

        const res = await fetch(url);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    };

    if (userId) fetchSuggestions();
  }, [userId, jobId, refreshKey]);

  return (
    <div style={styles.outer}>
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
