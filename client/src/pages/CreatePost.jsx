import React, { useState } from "react";
import "react-quill/dist/quill.snow.css";
import { Navigate } from "react-router-dom";
import Editor from "../Editor";

function CreatePost() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState(null);
  const [redirect, setRedirect] = useState(false);

  async function createNewPost(ev) {
    ev.preventDefault();
    // Creates a new FormData object to hold the data of the post
    const data = new FormData();
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    data.set("file", files);

    // console.log(title, summary, content, files, files);

    try {
      // Sends a POST request to the server at "http://localhost:4000/post" with the FormData object as the body of the request. The credentials: "include" option tells the browser to include any cookies associated with the current domain when making the request.
      const response = await fetch("http://localhost:4000/post", {
        method: "POST",
        body: data,
        credentials: "include",
      });

      // Verifica si la respuesta es exitosa
      if (response.ok) {
        console.log("Post creado exitosamente");
        setRedirect(true);
      } else {
        // Maneja respuestas con errores HTTP
        const errorData = await response.json(); // Asume que el servidor responde con JSON
        console.error("Error al crear el post:", errorData);
        // Opcional: Puedes manejar el error de manera más específica aquí
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
    }
  }

  if (redirect) {
    return <Navigate to="/" />;
  }

  return (
    <form onSubmit={createNewPost}>
      <h4>New Post</h4>
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
      <input
        type="file"
        accept="image/"
        onChange={(ev) => setFiles(ev.target.files[0])}
      />
      <Editor onChange={setContent} value={content} />
      <button style={{ marginTop: "5px" }} className="mt-5">
        Create post
      </button>
    </form>
  );
}

export default CreatePost;
