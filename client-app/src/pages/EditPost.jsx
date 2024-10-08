/* -------------------------------------------------------------------------- */
/*                             EDIT POST COMPONENT                            */
/* -------------------------------------------------------------------------- */

import React, { useState, useEffect, useContext } from "react";
import { Navigate, useParams } from "react-router-dom";
import Editor from "../Editor";
import "react-quill/dist/quill.snow.css";
import { UserContext } from "../UserContext";

function EditPost() {
  const { id } = useParams();
  const { baseUrl } = useContext(UserContext);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState("");

  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseUrl}/post/` + id);
        const responseToJson = await response.json();
        setTitle(responseToJson.title);
        setSummary(responseToJson.summary);
        setContent(responseToJson.content);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  async function updatePost(ev) {
    ev.preventDefault();

    const data = new FormData();
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    data.set("id", id);

    if (files?.[0]) {
      data.set("file", files?.[0]);
    }

    const response = await fetch(`${baseUrl}/post/`, {
      method: "PUT",
      body: data,
      credentials: "include",
    });

    if (response.ok) {
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to={"/post/" + id} />;
  }

  return (
    <form onSubmit={updatePost}>
      <input
        type="title"
        placeholder={"Title"}
        value={title}
        onChange={(ev) => setTitle(ev.target.value)}
      />
      <input
        type="summary"
        placeholder={"Summary"}
        value={summary}
        onChange={(ev) => setSummary(ev.target.value)}
      />
      <input type="file" onChange={(ev) => setFiles(ev.target.files)} />
      <Editor onChange={setContent} value={content} />
      <button style={{ marginTop: "5px" }} className="mt-5">
        Edit post
      </button>
    </form>
  );
}

export default EditPost;
