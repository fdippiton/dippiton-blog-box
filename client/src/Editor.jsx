import React from "react";
import ReactQuill from "react-quill";

export default function Editor({ value, onChange }) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
  ];

  const editorStyle = {
    height: "200px", // Puedes ajustar el porcentaje o el valor en píxeles según tus necesidades
    margin: "auto", // Esto centra el editor en el contenedor
  };

  return (
    <ReactQuill
      value={value}
      theme="snow"
      onChange={onChange}
      modules={modules}
      formats={formats}
      style={editorStyle}
    />
  );
}
