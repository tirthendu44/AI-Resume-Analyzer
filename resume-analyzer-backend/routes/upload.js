const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Uploads folder created:", uploadDir);
}

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const extractText = require("../utils/extractText");
const analyzeResume = require("../utils/analyzeResume");
const db = require("../config/db");

const router = express.Router();

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post("/resume", upload.single("resume"), async (req, res) => {
  try {
    console.log("Upload route body:", req.body);

    const { userId } = req.body;
    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      return res.status(400).json({ error: "Invalid userId in request body" });
    }

    const filePath = req.file.path;

    // Extract text from uploaded file
    const text = await extractText(filePath);

    // Analyze resume with Gemini
    const skills = await analyzeResume(text);

    const technicalSkills = skills.technicalSkills || [];
    const domainKnowledge = skills.domainKnowledge || [];

    await db.query(
      "UPDATE skills SET technical_skills = $2, domain_knowledge = $3 WHERE user_id = $1",
      [userIdInt, technicalSkills, domainKnowledge]
    );

    // ✅ Delete the uploaded file after analysis
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Failed to delete uploaded file:", err);
      } else {
        console.log("Uploaded file deleted:", filePath);
      }
    });

    res.json({
      message: "File uploaded, analyzed, and deleted successfully",
      skills
    });
  } catch (err) {
    console.error("Error analyzing resume:", err);
    res.status(500).json({ error: "Failed to analyze resume" });
  }
});

module.exports = router;
