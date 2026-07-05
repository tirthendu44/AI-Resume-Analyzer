import React, { useEffect, useState } from "react";
import api from "../services/api";

function MatchResults({ userId, jobId }) {
  const [match, setMatch] = useState(null);

  useEffect(() => {
    async function fetchMatch() {
      const res = await api.get(`/matches/${userId}?jobId=${jobId}`);
      setMatch(res.data);
    }
    if (userId && jobId) fetchMatch();
  }, [userId, jobId]);

  if (!match) return <p>No match results yet.</p>;

  return (
    <div>
      <h2>Match Score: {match.score}%</h2>
      <p>{match.explanation}</p>
      <h3>Missing Skills</h3>
      <ul>
        {match.missingSkills.map((skill, i) => <li key={i}>{skill}</li>)}
      </ul>
    </div>
  );
}

export default MatchResults;