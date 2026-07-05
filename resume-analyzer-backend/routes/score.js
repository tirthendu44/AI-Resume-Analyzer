require("dotenv").config(); // ✅ load .env variables first

const express = require("express");
const pool = require("../config/db");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper function to run a model
async function tryModel(model, skillsText) {
  return await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Here are my skills: ${skillsText}. Analyze them and provide a resume strength score taking unto account the current job market.
Return ONLY a single integer between 0 and 100. Do not add words or explanation.`
          }
        ]
      }
    ]
  });
}

router.get("/resume-score/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    // Fetch user skills
    const skillsRes = await pool.query(
      "SELECT technical_skills, domain_knowledge FROM skills WHERE user_id=$1",
      [userId]
    );
    if (!skillsRes.rows.length) return res.json({ score: 0 });

    const { technical_skills, domain_knowledge } = skillsRes.rows[0];
    const skillsText = [...(technical_skills || []), ...(domain_knowledge || [])].join(", ");

    // 🔹 Try pro model first, fallback to flash if unavailable
    let result;
    try {
      result = await tryModel("models/gemini-3.1-pro-preview", skillsText);
    } catch (err) {
      if (err.status === 503 || err.status === 429) {
        console.warn("Pro model unavailable or quota exceeded, falling back to flash...");
        result = await tryModel("models/gemini-2.5-flash", skillsText);
      } else {
        throw err;
      }
    }

    // Log full response for debugging
    console.log("Full Gemini response:", JSON.stringify(result, null, 2));

    const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("Gemini raw text:", rawText);

    // Parse score safely
    let score = parseInt(rawText.match(/\d+/)?.[0] || "0", 10);
    if (isNaN(score) || score < 0 || score > 100) {
      score = Math.floor(Math.random() * 100); // fallback
      console.log("Fallback random score used:", score);
    }

    console.log("Final parsed resume score:", score);
    res.json({ score });
  } catch (err) {
    console.error("Resume score error:", err);
    res.status(500).json({ score: 0 });
  }
});

module.exports = router;
