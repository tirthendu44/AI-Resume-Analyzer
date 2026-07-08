import React, { useState, useEffect } from "react";
import JobList from "./JobList.jsx";

// Use environment variable for API base
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function Jobs() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${API_BASE}/jobs`);
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };
    fetchJobs();
  }, []);

  const handleJobSelect = (jobId) => {
    console.log("Selected Job:", jobId);
  };

  return (
    <div className="jobSection">
      <h2>Available Jobs</h2>
      <div className="jobCardContainer">
        <JobList jobs={jobs} onSelectJob={handleJobSelect} />
      </div>
    </div>
  );
}

export default Jobs;
