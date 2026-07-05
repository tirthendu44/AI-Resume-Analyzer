import React, { useState } from "react";
import { Link } from "react-router-dom";

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false); // track login error

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          console.log("Token received:", data.token);

          setError(false); // clear error if login succeeds
          onLogin(data.token);
        } else {
          setError(true); // show red outline if login fails
        }
      })
      .catch((err) => {
        console.error("Error logging in:", err);
        setError(true);
      });
  };

  return (
    <form className="LoginForm" onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={error ? "error-input" : ""}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className={error ? "error-input" : ""}
      />
      <button type="submit">Login</button>

      {error && <p className="error-text">Incorrect email or password</p>}

      <p className="signup-text">Not a registered user?</p>
      <Link to="/register" className="signup-btn">Sign Up</Link>
    </form>
  );
}

export default LoginForm;
