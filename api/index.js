/* -------------------------------------------------------------------------- */
/*                                   SERVER                                   */
/* -------------------------------------------------------------------------- */

/**
 * Load environment variables from a `.env` file into `process.env`.
 * This is a common practice to keep sensitive information like API keys, database credentials, etc., out of the codebase and manage them in a separate configuration file.
 */
require("dotenv").config();

const config = require("../config.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

/* --------------------------------- Models --------------------------------- */

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

/**
 * Enable CORS (Cross-Origin Resource Sharing) for the Express app.
 * This allows requests from specified origins, headers, and methods.
 */
const app = express();
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

/* -------------------------------------------------------------------------- */
/*                                 MIDDLEWARES                                */
/* -------------------------------------------------------------------------- */

/**
 * Initialize the Express app with various middleware.
 */

// multer es una biblioteca de middleware para Node.js que se utiliza para gestionar la carga de archivos (por ejemplo, imágenes, videos, documentos) en aplicaciones web. Facilita la manipulación de datos de formulario que contienen archivos, que generalmente se envían mediante formularios HTML.
// const uploadMiddleware = multer({ dest: "uploads/" });
const secretKey = process.env.SECRET_KEY;
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use("/uploads", express.static(__dirname + "/uploads"));

/* ---------------------------- Connect database ---------------------------- */
/**
 * Connect to the MongoDB database using the connection string from the `.env` file.
 */
const connectionString = process.env.CONNECTIONSTRING;

if (typeof connectionString !== "string" || !connectionString.trim()) {
  throw new Error(
    "CONNECTIONSTRING no está definida en el archivo .env o está vacía"
  );
}
mongoose.connect(connectionString);

/* --------------------- Image storage Cloudinary config -------------------- */

/**
 * Configure Cloudinary for image storage.
 */
cloudinary.config({
  cloud_name: process.env.IMAGES_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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
/**
 * Login a user.
 * example:
 * POST /login
 * {
 *   "username": "johnDoe",
 *   "password": "password123"
 * }
 */
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body; // destructure request body for username and password
  const hashedPassword = await bcrypt.hash(password, 10); // Hashear la contraseña antes de almacenarla

  try {
    const userDoc = await User.create({ username, password: hashedPassword }); // create new user  with username and password
    res.json(userDoc); // respond with new user  as JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el usuario." });
  }
});

/* -------------------------------------------------------------------------- */
/*                                    Login                                   */
/* -------------------------------------------------------------------------- */

/**
 * Get the current user's info.
 * example
 * GET /profile
 */
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body; // destructure request body for username and password

  // Input validation: ensure username and password are present
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  try {
    const userDoc = await User.findOne({ username }); // find user in database

    // check if user exists
    if (!userDoc) {
      return res.status(401).json({ error: "Credenciales inválidas." }); // respond with error if user doesn't exist
    } else {
      // Hash and store passwords securely using bcrypt
      const passwordMatch = await bcrypt.compare(password, userDoc.password); // compare password from request body with password from database

      // check if passwords match
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials." }); // respond with error if passwords don't match
      } else {
        // Generate and sign JSON Web Token with explicit options
        const token = jwt.sign({ username, id: userDoc._id }, secretKey, {
          algorithm: "HS256",
          expiresIn: "1h", // adjust the expiration time as needed
        });

        // Set cookie with token and send user details in response
        res
          .cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
          })
          .json({
            id: userDoc._id,
            username,
          });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* -------------------------------------------------------------------------- */
/*                            Get current user info                           */
/* -------------------------------------------------------------------------- */
/**
 * Handles GET requests to the /profile endpoint.
 *
 * This endpoint verifies the authentication token sent in the cookies and returns the user information as JSON.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 *
 * @example
 *  Example request:
 * GET /profile HTTP/1.1
 * Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWYxMmM3MzE1NzA3IiwibmFtZSI6IkpvaGFuIjoiMjMwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *
 *  Example response:
 * HTTP/1.1 200 OK
 * Content-Type: application/json
 *
 * {
 *   "user": {
 *     "id": "5f12c7315707",
 *     "name": "John",
 *     "age": 23
 *   }
 * }
 */
app.get("/api/profile", (req, res) => {
  const { token } = req.cookies; // Get token from cookies

  // Verify token with secret key
  jwt
    .verify(token, secretKey, {}, (err, info) => {
      if (err) {
        // Handle error cases
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ error: "Token has expired" });
        } else {
          return res.status(401).json({ error: "Invalid token" });
        }
      }

      res.json(info); // If token is valid, send user information as JSON
    })
    .catch((err) => {
      // Catch any unexpected errors
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

/* -------------------------------------------------------------------------- */
/*                                   Logout                                   */
/* -------------------------------------------------------------------------- */
/**
 * Logs out the user by clearing the authentication token cookie.
 *
 * @api {post} /logout
 * @description Clears the authentication token cookie, effectively logging out the user.
 * @example
 * curl -X POST \
  http://localhost:3000/logout \
  -H 'Content-Type: application/json'
 *
 * @response {json} "ok" - Indicates that the logout was successful.
 */
app.post("/api/logout", (req, res) => {
  res.clearCookie("token", { maxAge: 0, secure: true }); // Clear the token cookie securely
  req.session.destroy(() => {
    // Assuming you're using express-session
    res.status(204).json("ok"); // Return a 204 status code
  });
});

/* -------------------------------------------------------------------------- */
/*                               Create new post                              */
/* -------------------------------------------------------------------------- */
/**
 * Handles POST requests to create a new post.
 * 
 * This endpoint expects a JSON body with the following properties:
 * - `title`: The title of the post.
 * - `summary`: A brief summary of the post.
 * - `content`: The main content of the post.
 * - `file`: An optional file to be uploaded as the post's cover image.
 * 
 * The endpoint also expects a valid JWT token in the `Authorization` header.
 * 
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * 
 * @example
 * curl -X POST \
  http://localhost:3000/post \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"title": "My New Post", "summary": "This is a summary", "content": "This is the content", "file": "path/to/file"}'
 */

app.post("/api/post", upload.single("file"), async (req, res) => {
  try {
    const { token } = req.cookies; // Verifying the user's JWT token
    const decoded = jwt.verify(token, secretKey);
    const { title, summary, content } = req.body;

    // Validate incoming request data
    if (!title || !summary || !content) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    let fileUrl = null;
    if (req.file) {
      fileUrl = req.file.path; // Esta es la URL de Cloudinary
    }

    console.log("data", title, summary, content, fileUrl);

    // Create a new post in the database
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: fileUrl,
      author: decoded.id,
    });

    // Send the newly created post as a JSON response
    res.json(postDoc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* -------------------------------------------------------------------------- */
/*                                Get all posts                               */
/* -------------------------------------------------------------------------- */

/**
 * Retrieve a list of the 20 most recent posts from the database.
 *
 * @route GET /post
 * @summary Get recent posts
 * @returns {object[]} - An array of post objects, each containing the post data and the author's username
 * @example response:
 * [
 *   {
 *     "_id": "postId1",
 *     "title": "Post 1",
 *     "content": "This is post 1",
 *     "createdAt": "2022-01-01T00:00:00.000Z",
 *     "author": {
 *       "_id": "authorId1",
 *       "username": "johnDoe"
 *     }
 *   },
 *   ...
 * ]
 */
app.get("/api/post", async (req, res) => {
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

/**
 * Retrieves a post by ID and returns it as JSON.
 *
 * @route GET /post/:id
 * @param {string} id - The ID of the post to retrieve.
 * @returns {object} The post document with the author's username populated.
 *
 * @example
 *  Request
 * GET /post/1234567890
 *
 *  Response
 * {
 *   "_id": "1234567890",
 *   "title": "Example Post",
 *   "content": "This is an example post.",
 *   "author": {
 *     "_id": "9876543210",
 *     "username": "johnDoe"
 *   }
 * }
 */
app.get("/api/post/:id", async (req, res) => {
  const { id } = req.params; // Destructure id from params
  const postDoc = await Post.findById(id).populate("author", ["username"]); // Find post by id, populate author, it means include the username from author model
  res.json(postDoc); // Return post document as json
});

/* -------------------------------------------------------------------------- */
/*                                 Update post                                */
/* -------------------------------------------------------------------------- */

/**
 * Updates a post with the provided ID, verifying the user's JWT token and checking post ownership.
 *
 * @param {string} req.body.id - The ID of the post to update.
 * @param {string} req.body.title - The new title of the post.
 * @param {string} req.body.summary - The new summary of the post.
 * @param {string} req.body.content - The new content of the post.
 * @param {file} req.file - The new cover image of the post (optional).
 *
 * @returns {object} The updated post as a JSON response.
 *
 * @example
 *  Update a post with ID "12345" and a new title, summary, and content
 * const updatedPost = await updatePost({
 *   id: "12345",
 *   title: "New Title",
 *   summary: "New Summary",
 *   content: "New Content",
 * });
 *
 * Update a post with ID "67890" and a new cover image
 * const updatedPostWithImage = await updatePost({
 *   id: "67890",
 *   title: "New Title",
 *   summary: "New Summary",
 *   content: "New Content",
 *   file: "/path/to/new/image.jpg",
 * });
 */

app.put("/api/post/", upload.single("file"), async (req, res) => {
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
      fileUrl = req.file.path; // URL de Cloudinary
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

    res.json(postDoc); // Sending the updated post as a JSON response
  });
});

/* -------------------------------------------------------------------------- */
/*                                Delete a post                               */
/* -------------------------------------------------------------------------- */
app.delete("/api/delete/:id", async (req, res) => {
  // Verificar el token JWT del usuario y comprobar la propiedad del post
  const { token } = req.cookies;
  jwt.verify(token, secretKey, {}, async (err, info) => {
    if (err) throw err;
    const { id } = req.params; // Obtener el id del parámetro de ruta

    try {
      const post = await Post.findById(id); // Buscar el post antes de eliminarlo

      if (!post) {
        return res.status(404).json("Post not found");
      }

      // Verificar si el usuario es el autor del post
      const isAuthor = JSON.stringify(post.author) === JSON.stringify(info.id);

      if (!isAuthor) {
        return res.status(400).json("You are not the author");
      }

      console.log("URL de la imagen:", post.cover); // Si el post tiene una imagen, eliminarla de Cloudinary

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
