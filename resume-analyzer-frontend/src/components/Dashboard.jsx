import React, { useState, useEffect } from "react";
import JobList from "./JobList.jsx";
import SkillsSection from "./SkillsSection.jsx";
import { jwtDecode } from "jwt-decode"; // ✅ correct named import
import Pie from "./Pie.jsx";
import Suggestions from "./Suggestions.jsx";
import "../style.css";

function Dashboard() {
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const userId = decoded?.userId || null;

  const [skills, setSkills] = useState([]);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [resumeScore, setResumeScore] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchSkills = async () => {
    try {
      const res = await fetch(`http://localhost:5000/auth/skills/${userId}`);
      const data = await res.json();
      const combined = [
        ...(data.technical_skills || []),
        ...(data.domain_knowledge || []),
      ];
      setSkills(combined);
    } catch (err) {
      console.error("Error fetching skills:", err);
    }
  };

  const fetchMatchedJobs = async () => {
    try {
      const res = await fetch(`http://localhost:5000/jobs/matched/${userId}`);
      const data = await res.json();
      setMatchedJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching matched jobs:", err);
    }
  };

  const fetchResumeScore = async () => {
    try {
      const res = await fetch(`http://localhost:5000/score/resume-score/${userId}`);
      const data = await res.json();
      setResumeScore(data.score || 0);
    } catch (err) {
      console.error("Error fetching resume score:", err);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchSkills();
    fetchMatchedJobs();
    fetchResumeScore();
  }, [userId]);

  const handleSkillsUpdated = () => {
    fetchSkills();
    fetchMatchedJobs();
    fetchResumeScore();
    setRefreshKey(prev => prev + 1);
  };

  const handleJobSelect = (jobId) => {
    console.log("Selected Job:", jobId);
  };

  return (
    <div className="dashboard">
      <h1 className="heading">Dashboard</h1>
      <p className="welcome">
        Welcome back, {decoded?.firstName ? decoded.firstName : "User"}
      </p>

      <div className="dashboard-layout">
        {/* Left column: Pie + Suggestions */}
        <div className="left-column" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Pie card stays fixed */}
          <div className="card pie-card" style={{ width: "100%", flexShrink: 0 }}>
            <h2 className="card-title">Resume Strength</h2>
            <div className="center-content">
              <Pie percentage={resumeScore} colour="#4CAF50" refreshKey={refreshKey} />
            </div>
          </div>

          {/* Suggestions card expands with content */}
          <div className="card suggestions-card" >
            <h2 className="card-title">AI Suggestions</h2>
            <Suggestions userId={userId} refreshKey={refreshKey} />
          </div>
        </div>

        {/* Right column: Skills + Best Matches */}
        <div className="right-column">
          <div className="card">
            <h2 className="card-title">Skills</h2>
            <SkillsSection
              userId={userId}
              skillsFromServer={skills}
              onSkillsChange={setSkills}
              onSkillsUpdated={handleSkillsUpdated}
            />
          </div>

          <div className="card">
            <h2 className="card-title">Best Matches</h2>
            <div className="job-card-container">
              <JobList jobs={matchedJobs} onSelectJob={handleJobSelect} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
