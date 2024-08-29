/* -------------------------------------------------------------------------- */
/*                            DELETE POST COMPONENT                           */
/* -------------------------------------------------------------------------- */

import React from "react";
import { useState, useEffect, useContext } from "react";
import { Navigate, useParams } from "react-router-dom";
import { UserContext } from "../UserContext";

function DeletePost() {
  const { id } = useParams();
  const { baseUrl } = useContext(UserContext);
  const [redirect, setRedirect] = useState(false);

  async function deletePost(ev) {
    ev.preventDefault();

    const response = await fetch(`${baseUrl}/delete/${id}`, {
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
