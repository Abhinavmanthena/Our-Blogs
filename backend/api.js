import express from "express";
import bodyParser from "body-parser";
import pkg from "pg";
import cors from "cors"; // Import CORS
import dotenv from "dotenv"; // Import dotenv for environment variables

dotenv.config(); // Load environment variables from .env file

const { Pool } = pkg;

const app = express();
const port = 4000;

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "blog",
  password: process.env.DB_PASSWORD || "Abhinav1024",
  port: process.env.DB_PORT || 5432,
});

// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Get all posts
app.get("/posts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts ORDER BY date DESC");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving posts" });
  }
});

// Get a single post by ID
app.get("/posts/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Post not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving post" });
  }
});

// Create a new post
app.post("/posts", async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const result = await pool.query(
      "INSERT INTO posts (title, content, author, date) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, content, author, new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating post" });
  }
});

// Update a post by ID
app.patch("/posts/:id", async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const result = await pool.query(
      "UPDATE posts SET title = COALESCE($1, title), content = COALESCE($2, content), author = COALESCE($3, author) WHERE id = $4 RETURNING *",
      [title, content, author, req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Post not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating post" });
  }
});

// Delete a post by ID
app.delete("/posts/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM posts WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting post" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
