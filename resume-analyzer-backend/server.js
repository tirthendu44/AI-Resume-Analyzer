require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Import routes
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");
const uploadRoutes = require("./routes/upload");
const scoreRoutes = require("./routes/score");
const suggestionRoutes = require("./routes/suggestions"); // ✅ new suggestions route
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Ensure DB connection
require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/jobs", jobRoutes);
app.use("/upload", uploadRoutes);
app.use("/score", scoreRoutes);
app.use("/score", suggestionRoutes); // ✅ mount suggestions under /score

// Serve uploaded files statically (optional, for preview/download)
app.use("/uploads", express.static("uploads"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
