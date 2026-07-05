require("dotenv").config();
const db = require("../config/db"); // ✅ import your DB connection

async function analyzeResume(text, userId) {
  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const contents = `Here is a resume:\n\n${text}\n\n
    Extract technical skills and domain knowledge.
    Return ONLY valid JSON with keys: "technicalSkills" and "domainKnowledge".
    Do NOT include markdown fences, code blocks, or any extra text.`;

    const tryModel = async (modelName) => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents,
      });

      console.log(`Gemini full response (${modelName}):`, JSON.stringify(response, null, 2));

      let raw = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // 🔹 Remove markdown fences and labels
      raw = raw.replace(/```json|```/gi, "").trim();

      // 🔹 Extract only JSON block between first { and last }
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        raw = raw.substring(start, end + 1);
      }

      // 🔹 Extra cleanup: collapse whitespace
      raw = raw.replace(/\s+/g, " ").trim();

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (parseErr) {
        console.warn("Failed to parse Gemini output as JSON, returning fallback object");
        return {
          technicalSkills: [],
          domainKnowledge: [],
          rawOutput: raw, // keep raw text for debugging
        };
      }

      // 🔹 Guarantee both keys exist
      return {
        technicalSkills: Array.isArray(parsed.technicalSkills) ? parsed.technicalSkills : [],
        domainKnowledge: Array.isArray(parsed.domainKnowledge) ? parsed.domainKnowledge : [],
      };
    };

    // 🔹 Run Gemini model
    let result;
    try {
      result = await tryModel("gemini-3.1-pro-preview");
    } catch (err) {
      if (err.status === 503 || err.status === 429) {
        console.warn("Pro model unavailable or quota exceeded, falling back to flash...");
        result = await tryModel("gemini-2.5-flash");
      } else {
        throw err;
      }
    }

    // 🔹 Store skills in DB for this user
    if (userId) {
      try {
        await db.query(
  `INSERT INTO skills (user_id, technical_skills, domain_knowledge)
   VALUES ($1, $2, $3)
   ON CONFLICT (user_id)
   DO UPDATE SET technical_skills = EXCLUDED.technical_skills,
                 domain_knowledge = EXCLUDED.domain_knowledge`,
  [userIdInt, result.technicalSkills, result.domainKnowledge]
);
        console.log(`✅ Skills stored in DB for user ${userId}`);
      } catch (dbErr) {
        console.error("❌ Failed to store skills in DB:", dbErr.message);
      }
    }

    return result;
  } catch (err) {
    console.error("Gemini error:", err);
    throw err;
  }
}

module.exports = analyzeResume;
