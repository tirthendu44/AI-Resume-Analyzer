require("dotenv").config();
const express = require("express");
const pool = require("../config/db");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Suggestion route
router.get("/resume-suggestions/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const skillsRes = await pool.query(
      "SELECT technical_skills, domain_knowledge FROM skills WHERE user_id=$1",
      [userId]
    );
    if (!skillsRes.rows.length) return res.json({ suggestions: [] });

    const { technical_skills, domain_knowledge } = skillsRes.rows[0];
    const skillsText = [...(technical_skills || []), ...(domain_knowledge || [])].join(", ");

    let result;
    try {
      result = await ai.models.generateContent({
        model: "models/gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Here are my skills: ${skillsText}.
Suggest 3 or more specific improvements or new skills I should learn to strengthen my resume. 
Return them as a short bullet list.`
              }
            ]
          }
        ]
      });
    } catch (err) {
      console.error("Gemini API error:", err.message);
      return res.json({
        suggestions: [
          "Improve communication and teamwork skills",
          "Learn a modern frontend framework (React, Vue, Angular)",
          "Practice solving coding challenges on platforms like LeetCodeBut"
        ]
      });
    }

    const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Split into bullet points
    const suggestions = rawText.split("\n").filter((s) => s.trim() !== "");
    res.json({ suggestions });
  } catch (err) {
    console.error("Resume suggestions error:", err);
    res.status(500).json({ suggestions: [] });
  }
});

module.exports = router;
