import React, { useState, useEffect } from "react";

// Use environment variable for API base
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function SkillsSection({ userId, onSkillsUpdated }) {
  const [technicalSkills, setTechnicalSkills] = useState([]);
  const [domainKnowledge, setDomainKnowledge] = useState([]);
  const [adding, setAdding] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/skills/${userId}`);
        const data = await res.json();
        setTechnicalSkills(data.technical_skills || []);
        setDomainKnowledge(data.domain_knowledge || []);
      } catch (err) {
        console.error("Error fetching skills:", err);
      }
    };
    if (userId) fetchSkills();
  }, [userId]);

  const pushUpdate = async (tech) => {
    try {
      await fetch(`${API_BASE}/auth/skills/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technicalSkills: tech,
          domainKnowledge,
        }),
      });
      if (onSkillsUpdated) onSkillsUpdated(); // ✅ notify parent
    } catch (err) {
      console.error("Error updating skills:", err);
    }
  };

  const removeSkill = async (skillToRemove) => {
    const updatedTech = technicalSkills.filter((s) => s !== skillToRemove);
    setTechnicalSkills(updatedTech);
    await pushUpdate(updatedTech);
  };

  const handleAddSkill = async () => {
    if (newSkill.trim() !== "") {
      const updatedTech = [...technicalSkills, newSkill.trim()];
      setTechnicalSkills(updatedTech);
      setNewSkill("");
      setAdding(false);
      await pushUpdate(updatedTech);
    }
  };

  return (
    <div className="skills-section">
      <div className="skills-container">
        {technicalSkills.map((skill, index) => (
          <div key={index} className="skill-chip">
            {skill}
            <button className="remove-btn" onClick={() => removeSkill(skill)}>
              x
            </button>
          </div>
        ))}

        {!adding ? (
          <div className="skill-chip add-chip" onClick={() => setAdding(true)}>
            + Add Skill
          </div>
        ) : (
          <div className="skill-chip add-chip">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Enter skill"
            />
            <button onClick={handleAddSkill}>✔</button>
            <button onClick={() => setAdding(false)}>✖</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SkillsSection;
