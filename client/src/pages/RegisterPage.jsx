/* -------------------------------------------------------------------------- */
/*                           REGISTER PAGE COMPONENT                          */
/* -------------------------------------------------------------------------- */
import React from "react";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";

/*
This code is a functional component that serves as the register page for a website. The component maintains two pieces of state, username and password, using the useState hook.
The register function sends a POST request to the server with the entered username and password. The fetch API is used to send the request.
*/
function RegisterPage() {
  const { baseUrl } = useContext(UserContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function register(ev) {
    ev.preventDefault();

    const response = await fetch(`${baseUrl}/register`, {
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
      <h4>Dblogbox</h4>
      <h6>Sign up to explore and share amazing articles!</h6>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(ev) => setUsername(ev.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(ev) => setPassword(ev.target.value)}
      />
      <button>Register</button>
    </form>
  );
}

export default RegisterPage;
