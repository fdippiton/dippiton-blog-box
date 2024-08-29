// require("dotenv").config();
const express = require("express");
const config = require("../config.js");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Models
const User = require("./models/User");
const Post = require("./models/Post");

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
// multer es una biblioteca de middleware para Node.js que se utiliza para gestionar la carga de archivos (por ejemplo, imágenes, videos, documentos) en aplicaciones web. Facilita la manipulación de datos de formulario que contienen archivos, que generalmente se envían mediante formularios HTML.
// const uploadMiddleware = multer({ dest: "uploads/" });
const secretKey = config.SECRET_KEY;
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use("/uploads", express.static(__dirname + "/uploads"));

// Connect database
const connectionString = config.database.CONNECTIONSTRING;
mongoose.connect(connectionString);

cloudinary.config({
  cloud_name: config.IMAGES_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blog-box-images",
    allowed_formats: ["jpg", "png", "jpeg", "gif"],
  },
});

const upload = multer({ storage: storage });

/* -------------------------------------------------------------------------- */
/*                              Register new user                             */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/*                                    Login                                   */
/* -------------------------------------------------------------------------- */
app.post("/login", async (req, res) => {
  // destructure request body for username and password
  const { username, password } = req.body;
  // find user in database
  const userDoc = await User.findOne({ username });

  // check if user exists
  if (!userDoc) {
    // respond with error if user doesn't exist
    return res.status(401).json({ error: "Credenciales inválidas." });
  } else {
    // compare password from request body with password from database
    const passwordMatch = await bcrypt.compare(password, userDoc.password);

    // check if passwords match
    if (!passwordMatch) {
      // respond with error if passwords don't match
      return res.status(401).json({ error: "Credenciales inválidas." });
    } else {
      // res.json(userDoc);
      // generate and sign json web token
      jwt.sign({ username, id: userDoc._id }, secretKey, {}, (err, token) => {
        if (err) throw err;
        // set cookie with token and send user details in response
        res.cookie("token", token).json({
          id: userDoc._id,
          username,
        });
      });
    }
  }
});

/* -------------------------------------------------------------------------- */
/*                            Get current user info                           */
/* -------------------------------------------------------------------------- */
app.get("/profile", (req, res) => {
  // Get token from cookies
  const { token } = req.cookies;

  // Verify token with secret key
  jwt.verify(token, secretKey, {}, (err, info) => {
    // Check for error and throw it
    if (err) throw err;
    // Send user information as JSON
    res.json(info);
  });
});

/* -------------------------------------------------------------------------- */
/*                                   Logout                                   */
/* -------------------------------------------------------------------------- */
app.post("/logout", (req, res) => {
  // Setting cookie named 'token' to an empty string
  res.cookie("token", "").json("ok");
});

/* -------------------------------------------------------------------------- */
/*                               Create new post                              */
/* -------------------------------------------------------------------------- */

app.post("/post", upload.single("file"), async (req, res) => {
  // Verifying the user's JWT token
  const { token } = req.cookies;
  jwt.verify(token, secretKey, {}, async (err, info) => {
    if (err) return res.status(401).json({ error: "Token inválido" });
    const { title, summary, content, file } = req.body;

    let fileUrl = null;
    if (req.file) {
      fileUrl = req.file.path; // Esta es la URL de Cloudinary
    }
    console.log("data", title, summary, content, fileUrl);

    // Creating a new post in the database
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: fileUrl,
      author: info.id,
    });
    // Sending the newly created post as a JSON response
    res.json(postDoc);
  });
});

// app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
//   // Renaming the file with the correct extension
//   const { originalname, path } = req.file;
//   const parts = originalname.split(".");
//   const ext = parts[parts.length - 1];
//   const newPath = path + "." + ext;
//   fs.renameSync(path, newPath);

//   // Verifying the user's JWT token
//   const { token } = req.cookies;
//   jwt.verify(token, secretKey, {}, async (err, info) => {
//     if (err) throw err;
//     const { title, summary, content } = req.body;

//     // Creating a new post in the database
//     const postDoc = await Post.create({
//       title,
//       summary,
//       content,
//       cover: newPath,
//       author: info.id,
//     });
//     // Sending the newly created post as a JSON response
//     res.json(postDoc);
//   });
// });

/* -------------------------------------------------------------------------- */
/*                                Get all posts                               */
/* -------------------------------------------------------------------------- */
app.get("/post", async (req, res) => {
  // Find all posts in the database
  res.json(
    await Post.find()
      .populate("author", ["username"])
      .sort({ createdAt: -1 })
      .limit(20)
  );
});

/* -------------------------------------------------------------------------- */
/*                             Get a specific post                            */
/* -------------------------------------------------------------------------- */
app.get("/post/:id", async (req, res) => {
  // Destructure id from params
  const { id } = req.params;
  // Find post by id, populate author, it means include the username from author model
  const postDoc = await Post.findById(id).populate("author", ["username"]);
  // Return post document as json
  res.json(postDoc);
});

/* -------------------------------------------------------------------------- */
/*                                 Update post                                */
/* -------------------------------------------------------------------------- */
app.put("/post/", upload.single("file"), async (req, res) => {
  // Verify user's JWT token and check post ownership
  const { token } = req.cookies;
  jwt.verify(token, secretKey, {}, async (err, info) => {
    if (err) throw err;
    const { id, title, summary, content } = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json("You are not the author");
    }

    let fileUrl = null;
    if (req.file) {
      fileUrl = req.file.path; // Esta es la URL de Cloudinary
    }

    if (fileUrl) {
      const urlParts = postDoc.cover.split("/");
      const filename = urlParts[urlParts.length - 1];
      const publicId = filename.split(".")[0];
      console.log("Public ID extraído:", publicId);

      console.log("URL completa:", postDoc.cover);
      console.log("Filename extraído:", filename);
      console.log("Public ID extraído:", publicId);

      try {
        const result = await cloudinary.uploader.destroy(
          `blog-box-images/${publicId}`
        );
        console.log("Resultado de la eliminación en Cloudinary:", result);
      } catch (cloudinaryError) {
        console.error(
          "Error al eliminar la imagen de Cloudinary:",
          cloudinaryError
        );
      }
    }

    // Update the post
    await postDoc.updateOne({
      title,
      summary,
      content,
      cover: fileUrl ? fileUrl : postDoc.cover,
    });
    // Sending the updated post as a JSON response
    res.json(postDoc);
  });
});

// app.put("/post/", uploadMiddleware.single("file"), async (req, res) => {
//   let newPath = null;
//   if (req.file) {
//     // Renaming the file with the correct extension
//     const { originalname, path } = req.file;
//     const parts = originalname.split(".");
//     const ext = parts[parts.length - 1];
//     newPath = path + "." + ext;
//     fs.renameSync(path, newPath);
//   }

//   // Verify user's JWT token and check post ownership
//   const { token } = req.cookies;
//   jwt.verify(token, secretKey, {}, async (err, info) => {
//     if (err) throw err;
//     const { id, title, summary, content } = req.body;
//     const postDoc = await Post.findById(id);
//     const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
//     if (!isAuthor) {
//       return res.status(400).json("You are not the author");
//     }

//     // Update the post
//     await postDoc.updateOne({
//       title,
//       summary,
//       content,
//       cover: newPath ? newPath : postDoc.cover,
//     });
//     // Sending the updated post as a JSON response
//     res.json(postDoc);
//   });
// });

/* -------------------------------------------------------------------------- */
/*                                Delete a post                               */
/* -------------------------------------------------------------------------- */
app.delete("/delete/:id", async (req, res) => {
  // Verificar el token JWT del usuario y comprobar la propiedad del post
  const { token } = req.cookies;
  jwt.verify(token, secretKey, {}, async (err, info) => {
    if (err) throw err;

    // Obtener el id del parámetro de ruta
    const { id } = req.params;

    try {
      // Buscar el post antes de eliminarlo
      const post = await Post.findById(id);

      if (!post) {
        return res.status(404).json("Post not found");
      }

      // Verificar si el usuario es el autor del post
      const isAuthor = JSON.stringify(post.author) === JSON.stringify(info.id);

      if (!isAuthor) {
        return res.status(400).json("You are not the author");
      }

      // Si el post tiene una imagen, eliminarla de Cloudinary
      console.log("URL de la imagen:", post.cover);

      if (post.cover) {
        const urlParts = post.cover.split("/");
        const filename = urlParts[urlParts.length - 1];
        const publicId = filename.split(".")[0];
        console.log("Public ID extraído:", publicId);

        console.log("URL completa:", post.cover);
        console.log("Filename extraído:", filename);
        console.log("Public ID extraído:", publicId);

        try {
          const result = await cloudinary.uploader.destroy(
            `blog-box-images/${publicId}`
          );
          console.log("Resultado de la eliminación en Cloudinary:", result);
        } catch (cloudinaryError) {
          console.error(
            "Error al eliminar la imagen de Cloudinary:",
            cloudinaryError
          );
        }
      }

      // Eliminar el post de la base de datos
      const postDeleted = await Post.findByIdAndDelete(id);

      if (postDeleted) {
        console.log("Registro eliminado:", postDeleted);
        return res
          .status(200)
          .json("Post and associated image deleted successfully");
      } else {
        console.log("Error al eliminar el registro.");
        return res.status(500).json("Error deleting post");
      }
    } catch (error) {
      console.error("Error al eliminar el registro:", error);
      return res.status(500).json("Internal Server Error");
    }
  });
});

app.listen(4000);
