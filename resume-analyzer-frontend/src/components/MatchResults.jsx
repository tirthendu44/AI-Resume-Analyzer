import React, { useEffect, useState } from "react";
import api from "../services/api";

function MatchResults({ userId, jobId }) {
  const [match, setMatch] = useState(null);
  const [error, setError] = useState(null);   // ✅ track errors
  const [loading, setLoading] = useState(false); // ✅ track loading state

  useEffect(() => {
    async function fetchMatch() {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(`/matches/${userId}?jobId=${jobId}`);
        setMatch(res.data);
      } catch (err) {
        console.error("Error fetching match results:", err);
        setError("Failed to load match results. Please try again.");
        setMatch(null);
      } finally {
        setLoading(false);
      }
    }

    if (userId && jobId) fetchMatch();
  }, [userId, jobId]);

  if (loading) return <p>Loading match results...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!match) return <p>No match results yet.</p>;

  return (
    <div>
      <h2>Match Score: {match.score}%</h2>
      <p>{match.explanation}</p>
      <h3>Missing Skills</h3>
      <ul>
        {match.missingSkills?.map((skill, i) => (
          <li key={i}>{skill}</li>
        ))}
      </ul>
    </div>
  );
}

export default MatchResults;
