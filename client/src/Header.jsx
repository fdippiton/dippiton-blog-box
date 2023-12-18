import { useContext, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useState } from "react";
import { UserContext } from "./UserContext";
import { Dropdown } from "react-bootstrap";

export default function Header() {
  const { userInfo, setUserInfo } = useContext(UserContext);
  const username = userInfo?.username;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:4000/profile", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setUserInfo(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  function logout() {
    fetch("http://localhost:4000/logout", {
      method: "POST",
      credentials: "include",
    });
    setUserInfo(null);
    return <Navigate to={"/"} />;
  }

  return (
    <header>
      <Link to="/" className="logo">
        <h6>Dblogbox</h6>
      </Link>
      <nav>
        {username && (
          <Dropdown>
            <Dropdown.Toggle variant="" id="dropdown-basic">
              <strong>{username}</strong>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item as="div">
                <Link to="/create" id="NewPost">
                  Create new post
                </Link>
              </Dropdown.Item>
              <Dropdown.Item as="div">
                <Link onClick={logout} id="logout">
                  Logout
                </Link>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
        {!username && (
          <>
            {" "}
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
