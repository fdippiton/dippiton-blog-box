import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  /* The code snippet `<React.StrictMode>` is a component provided by React that helps in identifying
  potential issues in your code. When you wrap your components with `<React.StrictMode>`, React will
  perform additional checks and warnings during rendering to help you find and fix common issues like
  deprecated lifecycle methods, unsafe side effects, and more. */
  /* The code snippet `<BrowserRouter>` is a component provided by the React Router library. It is
  used to enable routing in a React application. */
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
