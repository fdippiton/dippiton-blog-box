import { useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useState } from "react";

export default function Header() {
  const [username, setUsername] = useState(null);

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
        setUsername(data.username);
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
    setUsername(null);
    return <Navigate to={"/"} />;
  }

  return (
    <header>
      <Link to="/" className="logo">
        dippiton-blogbox
      </Link>
      <nav>
        {username && (
          <>
            <h4>
              <strong>{username}</strong>
            </h4>
            <Link to="/create">Create new post</Link>
            <Link onClick={logout}>Logout</Link>
          </>
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
