const express = require("express");
const app = express();
const cors = require("cors");

// The code snippet provided is using the CORS (Cross-Origin Resource Sharing) middleware for a Node.js application. CORS is a security feature implemented by web browsers to prevent web pages from making requests to a different domain than the one that served the web page.

// In the context of Node.js, CORS middleware can be used to allow requests from specified origins, headers, and methods. This middleware can be used to secure your Node.js application and allow only specific domains to make requests to your application.

// The code app.use(cors()); is responsible for this. Here, app.use() is a function in Express.js that registers middleware. Middleware are functions that can execute any code, modify the request and response objects, end the request-response cycle, and call the next middleware in the stack. In this case, the cors() middleware function is used.

// By using this code, you are allowing CORS requests from any origin. However, it is important to note that you can specify which origins are allowed, as well as other options like headers and methods. Here is an example of how to configure CORS middleware:

// var corsOptions = {
//   origin: 'http://example.com',
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
//  };

// app.use(cors(corsOptions));

app.use(cors());

app.post("/register", (req, res) => {
  res.json("test ok");
});

app.listen(4000);
