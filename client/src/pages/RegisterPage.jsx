import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/*
This code is a functional component that serves as the register page for a website. The component maintains two pieces of state, username and password, using the useState hook.
The register function sends a POST request to the server with the entered username and password. The fetch API is used to send the request.
*/
function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function register(ev) {
    ev.preventDefault();

    const response = await fetch("http://localhost:4000/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.status === 200) {
      alert("Registration successful.");
      navigate("/login");
    } else {
      alert("Registration failed. Try again.");
    }
  }

  return (
    <form className="register" onSubmit={register}>
      <h1>Register</h1>
      <input
        type="text"
        placeholder="username"
        value={username}
        onChange={(ev) => setUsername(ev.target.value)}
      />
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(ev) => setPassword(ev.target.value)}
      />
      <button>Register</button>
    </form>
  );
}

export default RegisterPage;
