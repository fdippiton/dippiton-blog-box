import React from "react";
import { useState, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";

function DeletePost() {
  const { id } = useParams();

  const [redirect, setRedirect] = useState(false);

  async function deletePost(ev) {
    ev.preventDefault();

    const response = await fetch(`http://localhost:4000/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.ok) {
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to={"/"} />;
  }
  return (
    <div>
      ¿Are you sure you want to delete this post? <br></br>
      <button
        style={{ marginTop: "5px" }}
        onClick={deletePost}
        className="btn btn-danger w-25"
      >
        Delete
      </button>
    </div>
  );
}

export default DeletePost;
