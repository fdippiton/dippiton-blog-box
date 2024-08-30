/* -------------------------------------------------------------------------- */
/*                               HOME COMPONENT                               */
/* -------------------------------------------------------------------------- */

import { useEffect, useState, useContext } from "react";
import Post from "../Post";
import { UserContext } from "../UserContext";
import Hero from "../Hero";
import { Navigate } from "react-router-dom";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const { baseUrl, userInfo } = useContext(UserContext);
  const [loggedUser, setLoggedUser] = useState(false);
  const username = userInfo?.username;

  const handleStartReading = () => {
    setShowHero(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseUrl}/post`);
        const responseToJson = await response.json();
        setPosts(responseToJson);

        // Check if the token exists in cookies
        if (username) {
          console.log(username);
          setLoggedUser(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {loggedUser ? (
        <>
          <h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
              />
            </svg>{" "}
            All posts
          </h3>
          <div id="post">
            {posts.length > 0 ? (
              posts.map((post) => <Post {...post} key={post.id} />)
            ) : (
              <p>No posts available</p>
            )}
          </div>
        </>
      ) : (
        <Hero />
      )}
    </>
  );
}
