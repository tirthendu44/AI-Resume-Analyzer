require("dotenv").config();
const express = require("express");
const pool = require("../config/db");
const { GoogleGenAI } = require("@google/genai");
const stringSimilarity = require("string-similarity");

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ----------------------
// Get all jobs
// ----------------------
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM jobs");
    res.json(result.rows);
  } catch (err) {
    console.error("Jobs fetch error:", err);
    res.status(500).json([]);
  }
});

// ----------------------
// Get matched jobs (local fuzzy similarity)
// ----------------------
router.get("/matched/:userId", async (req, res) => {
  const { userId } = req.params;
  const parsedUserId = parseInt(userId, 10);
  if (isNaN(parsedUserId)) return res.status(400).json([]);

  try {
    const skillsRes = await pool.query(
      "SELECT technical_skills, domain_knowledge FROM skills WHERE user_id=$1",
      [parsedUserId]
    );
    if (!skillsRes.rows.length) return res.json([]);

    const { technical_skills, domain_knowledge } = skillsRes.rows[0];
    const userSkills = [...(technical_skills || []), ...(domain_knowledge || [])]
      .map(s => s.toLowerCase());

    const jobsRes = await pool.query("SELECT * FROM jobs");
    const jobs = jobsRes.rows;
    if (!jobs.length) return res.json([]);

    const matched = jobs.map(job => {
      const jobSkills = (job.required_skills || []).map(s => s.toLowerCase());
      const overlap = jobSkills.filter(jobSkill =>
        userSkills.some(userSkill =>
          stringSimilarity.compareTwoStrings(userSkill, jobSkill) > 0.7
        )
      );
      const score = jobSkills.length
        ? Math.round((overlap.length / jobSkills.length) * 100)
        : 0;
      return { ...job, matchScore: score, matchedSkills: overlap };
    }).filter(job => job.matchScore >= 50);

    res.json(matched);
  } catch (err) {
    console.error("Matched jobs error:", err);
    res.status(500).json([]);
  }
});

// ----------------------
// Get match score + targeted suggestions in one call
// ----------------------
router.get("/analysis/:userId/:jobId", async (req, res) => {
  const { userId, jobId } = req.params;
  const parsedUserId = parseInt(userId, 10);
  const parsedJobId = parseInt(jobId, 10);

  if (isNaN(parsedUserId) || isNaN(parsedJobId)) {
    return res.status(400).json({ score: 0, job: null, matchedSkills: [], suggestions: [] });
  }

  try {
    // Fetch user skills
    const userRes = await pool.query(
      "SELECT technical_skills, domain_knowledge FROM skills WHERE user_id=$1",
      [parsedUserId]
    );
    if (!userRes.rows.length) return res.json({ score: 0, job: null, matchedSkills: [], suggestions: [] });

    const userSkills = [
      ...(userRes.rows[0].technical_skills || []),
      ...(userRes.rows[0].domain_knowledge || [])
    ];

    // Fetch job details
    const jobRes = await pool.query(
      "SELECT id, title, company, description, domain, required_skills FROM jobs WHERE id=$1",
      [parsedJobId]
    );
    if (!jobRes.rows.length) return res.json({ score: 0, job: null, matchedSkills: [], suggestions: [] });

    const job = jobRes.rows[0];
    const requiredSkills = job.required_skills || [];

    // --- Call Gemini once ---
    let result;
    try {
      result = await ai.models.generateContent({
        model: "models/gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Compare the following user skills with the required skills for the job.
Return a JSON object with:
- "score": a number between 0 and 100 representing match percentage
- "matchedSkills": an array of overlapping skills
- "suggestions": an array of 3–5 improvements or new skills the user should learn to better match the job "${job.title}" at ${job.company}

User skills: ${JSON.stringify(userSkills)}
Job required skills: ${JSON.stringify(requiredSkills)}`
              }
            ]
          }
        ]
      });
    } catch (err) {
      console.error("Gemini API error:", err.message);
      return res.json({ score: 0, job, matchedSkills: [], suggestions: [] });
    }

    // Extract JSON safely
    let score = 0;
    let matchedSkills = [];
    let suggestions = [];
    try {
      let rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      rawText = rawText.replace(/```json|```/g, "").trim();
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) rawText = jsonMatch[0];
      const parsed = JSON.parse(rawText);
      score = parsed.score || 0;
      matchedSkills = parsed.matchedSkills || [];
      suggestions = parsed.suggestions || [];
    } catch (err) {
      console.error("Error parsing Gemini response:", err);
    }

    res.json({ score, job, matchedSkills, suggestions });
  } catch (err) {
    console.error("Job analysis error:", err);
    res.status(500).json({ score: 0, job: null, matchedSkills: [], suggestions: [] });
  }
});
module.exports = router;