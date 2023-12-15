import { useEffect, useState } from "react";
import Post from "../Post";

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:4000/post");
        const responseToJson = await response.json();
        setPosts(responseToJson);
        console.log(responseToJson);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return <>{posts.length > 0 && posts.map((post) => <Post {...post} />)}</>;
}
