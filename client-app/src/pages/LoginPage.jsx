/* -------------------------------------------------------------------------- */
/*                            LOGIN PAGE COMPONENT                            */
/* -------------------------------------------------------------------------- */

import React from "react";
import { useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";

function LoginPage() {
  const { setUserInfo, baseUrl } = useContext(UserContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);

  async function login(ev) {
    ev.preventDefault();

    /* The code snippet you provided is making a POST request to "http://localhost:4000/login" endpoint
   with the following configurations: */
    const response = await fetch(`${baseUrl}/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      mode: "cors",
    });

    if (response.ok) {
      response.json().then((userInfo) => {
        setUserInfo(userInfo);
        setRedirect(true);
      });
    } else {
      alert("Login failed. Try again.");
    }
  }

  if (redirect) {
    return <Navigate to={"/"} />;
  }

  return (
    <form className="login" onSubmit={login}>
      <h4>Dblogbox</h4>
      <h6>Welcome back! Please log in to continue.</h6>

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
      <button>Login</button>
    </form>
  );
}

export default LoginPage;
