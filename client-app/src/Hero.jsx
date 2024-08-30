import React from "react";
import { Link } from "react-router-dom";

function Hero({}) {
  return (
    <div className="hero">
      <h1>Dblogbox</h1>
      <h4>
        Your daily dose of inspiration, tips, and stories from around the globe.
      </h4>
      <Link className="btn-reading" to="/login">
        Start Reading
      </Link>
    </div>
  );
}

export default Hero;
