const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../config/db");
const router = express.Router();
const jwt = require("jsonwebtoken");

// REGISTER route
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists. Try again or Log in" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insert user first
    const newUser = await db.query(
      "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
      [firstName, lastName, email, hashedPassword]
    );
    console.log("New user row:", newUser.rows[0]);


    // ✅ Then insert empty skills row for that user
    await db.query(
      "INSERT INTO skills (user_id, technical_skills, domain_knowledge) VALUES ($1, $2, $3)",
      [newUser.rows[0].id, [], []]
    );

    const payload = {
      userId: newUser.rows[0].id,
      firstName: newUser.rows[0].first_name,
      lastName: newUser.rows[0].last_name,
      email: newUser.rows[0].email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    console.error("Error registering user:", err.message, err.stack);
    res.status(500).json({ error: "Registration failed: " + err.message });
  }
});


// LOGIN route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    console.log("Fetched user row:", user);

    const payload = {
      userId: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("Inserting skills for userId:", user.id);
 
    
    res.json({ token });
    
  } catch (err) {
    console.error("Error logging in:", err.message, err.stack);
    res.status(500).json({ error: "Login failed: " + err.message });
  }
});

// 🔹 Route to update skills after Gemini analysis
router.post("/skills/:userId", async (req, res) => {
  const { userId } = req.params;
  const { technicalSkills, domainKnowledge } = req.body;

  try {
    await db.query(
      "UPDATE skills SET technical_skills = $2, domain_knowledge = $3 WHERE user_id = $1",
      [userId, technicalSkills, domainKnowledge]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating skills:", err.message);
    res.status(500).json({ error: "Failed to update skills" });
  }
});

// 🔹 Route to fetch skills for dashboard
router.get("/skills/:userId", async (req, res) => {
  const { userId } = req.params;
  const userIdInt = parseInt(userId, 10);

  if (isNaN(userIdInt)) {
    console.error("Invalid userId received:", userId);
    return res.status(400).json({ error: "Invalid userId" });
  }

  try {
    const result = await db.query(
      "SELECT technical_skills, domain_knowledge FROM skills WHERE user_id = $1",
      [userIdInt]   // ✅ always an integer
    );

    if (result.rows.length === 0) {
      return res.json({ technicalSkills: [], domainKnowledge: [] });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching skills:", err.message);
    res.status(500).json({ error: "Failed to fetch skills" });
  }
});
module.exports = router;
