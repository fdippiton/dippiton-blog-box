import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
