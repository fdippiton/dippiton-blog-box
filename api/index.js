// require("dotenv").config();
const express = require("express");
const config = require("../config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { default: mongoose } = require("mongoose");

// Models
const User = require("./models/User");

// The code snippet provided is using the CORS (Cross-Origin Resource Sharing) middleware for a Node.js application. CORS is a security feature implemented by web browsers to prevent web pages from making requests to a different domain than the one that served the web page.

// In the context of Node.js, CORS middleware can be used to allow requests from specified origins, headers, and methods. This middleware can be used to secure your Node.js application and allow only specific domains to make requests to your application.

// The code app.use(cors()); is responsible for this. Here, app.use() is a function in Express.js that registers middleware. Middleware are functions that can execute any code, modify the request and response objects, end the request-response cycle, and call the next middleware in the stack. In this case, the cors() middleware function is used.

// By using this code, you are allowing CORS requests from any origin. However, it is important to note that you can specify which origins are allowed, as well as other options like headers and methods. Here is an example of how to configure CORS middleware:

// var corsOptions = {
//   origin: 'http://example.com',
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
//  };

// app.use(cors(corsOptions));

const app = express();
const secretKey = config.SECRET_KEY;
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());

// Connect database
const connectionString = config.database.CONNECTIONSTRING;
mongoose.connect(connectionString);

app.post("/register", async (req, res) => {
  // destructure request body for username and password
  const { username, password } = req.body;

  // Hashear la contraseña antes de almacenarla
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // create new user  with username and password
    const userDoc = await User.create({ username, password: hashedPassword });
    // respond with new user  as JSON
    res.json(userDoc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el usuario." });
  }
});

app.post("/login", async (req, res) => {
  // destructure request body for username and password
  const { username, password } = req.body;

  const userDoc = await User.findOne({ username });

  // Si el usuario no existe, responde con un error
  if (!userDoc) {
    return res.status(401).json({ error: "Credenciales inválidas." });
  } else {
    // Compara la contraseña proporcionada con la almacenada en la base de datos
    const passwordMatch = await bcrypt.compare(password, userDoc.password);

    // Si las contraseñas no coinciden, responde con un error
    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    } else {
      // res.json(userDoc);
      jwt.sign({ username, id: userDoc._id }, secretKey, {}, (err, token) => {
        if (err) throw err;
        res.cookie("token", token).json("ok");
      });
    }
  }
});

app.listen(4000);
