import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function PostPage() {
  const { id } = useParams();
  const [postInfo, setPostInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`http://localhost:4000/post/${id}`);
      const responseToJson = await response.json();
      setPostInfo(responseToJson);
      console.log(postInfo);
    };

    fetchData();
  }, []);

  if (!postInfo) return "";

  return (
    <div className="post-page">
      <div className="image">
        <img src={`http://localhost:4000/${postInfo.cover}`} />
      </div>
      <h1>{postInfo.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: postInfo.content }}></div>
    </div>
  );
}

export default PostPage;
