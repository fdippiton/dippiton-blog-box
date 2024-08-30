import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { Dropdown } from "react-bootstrap";

export default function Header() {
  const { userInfo, setUserInfo, baseUrl } = useContext(UserContext);
  const username = userInfo?.username;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseUrl}/profile`, {
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

  async function logout() {
    try {
      await fetch(`${baseUrl}/logout`, {
        method: "POST",
        credentials: "include",
      });

      // Después de la solicitud fetch, actualiza el estado
      setUserInfo(null);

      // Redirecciona a la página principal
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Error during logout:", error);
    }
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
