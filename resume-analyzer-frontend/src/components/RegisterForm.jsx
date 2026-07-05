import React, { useState } from "react";

function RegisterForm({ onLogin }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const registerData = { firstName, lastName, email, password };

    fetch("http://localhost:5000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registerData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Register response:", data); // 🔹 Debug line

        if (data.error) {
          setError(data.error);
        } else if (data.token) {
          setError("");
          onLogin(data.token);
        }
      })
      .catch((err) => {
        console.error("Error registering:", err);
        setError("Registration failed. Please try again.");
      });
  };

  return (
    <form className="RegisterForm" onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
        className={error ? "error-input" : ""}
      />
      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
        className={error ? "error-input" : ""}
      />
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
        placeholder="Set password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className={error ? "error-input" : ""}
      />
      <button type="submit">Sign Up</button>

      {error && <p className="error-text">{error}</p>}
    </form>
  );
}

export default RegisterForm;
