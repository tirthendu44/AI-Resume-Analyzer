import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "./components/Navbar";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Dashboard from "./components/Dashboard";
import MatchResults from "./components/MatchResults";
import ResumeUpload from "./components/ResumeUpload";
import JobDetailsPage from "./components/JobDetailsPage";

import Jobs from "./components/Jobs";   // ✅ Added import
import "./style.css";

function App() {
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      const decoded = jwtDecode(storedToken);
      setUserId(decoded.userId);
    }
  }, []);

  const handleLogin = (jwtToken) => {
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);
    const decoded = jwtDecode(jwtToken);
    setUserId(decoded.userId);
    window.location.href = "/dashboard";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUserId(null);
    window.location.href = "/login"; // redirect to login
  };

  return (
    <Router>
      <Navbar isLoggedIn={!!token} onLogout={handleLogout} />
      <Routes>
        <Route
          path="/"
          element={
            token ? (
              <Dashboard userId={userId} />
            ) : (
              <LoginForm onLogin={handleLogin} />
            )
          }
        />
        <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterForm onLogin={handleLogin} />} />
        <Route path="/jobs" element={<Jobs />} />   {/* ✅ Jobs route */}
        <Route path="/dashboard" element={<Dashboard userId={userId} />} />
        <Route path="/matches/:jobId" element={<MatchResults />} />
        <Route path="/upload" element={<ResumeUpload />} />
        <Route path="/job/:jobId" element={<JobDetailsPage userId={userId} />} />

      </Routes>
    </Router>
  );
}

export default App;
