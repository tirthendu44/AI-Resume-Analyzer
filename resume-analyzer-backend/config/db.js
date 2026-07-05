const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",       // your DB username
  host: "localhost",
  database: "ResumeAnalyzer", // your DB name
  password: "9432393003",
  port: 5432,
});

module.exports = pool;