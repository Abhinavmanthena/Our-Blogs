import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url"; 
import dotenv from "dotenv"; 

dotenv.config(); 


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.FRONTEND_PORT || 3000; 
const API_URL = process.env.API_URL || "https://our-blogs.onrender.com"; 

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "..", "frontend", "views"));

app.use(express.static(path.join(__dirname, "..", "frontend", "public"))); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/posts`);
    res.render("index.ejs", { posts: response.data });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).render("error.ejs", { message: "Error fetching posts" }); 
  }
});

app.get("/new", (req, res) => {
  res.render("modify.ejs", {
    heading: "New Post",
    submit: "Create Post",
    post: {},
  });
});

app.get("/edit/:id", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/posts/${req.params.id}`);
    res.render("modify.ejs", {
      heading: "Edit Post",
      submit: "Update Post",
      post: response.data,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).render("error.ejs", { message: "Error fetching post" }); 
  }
});

app.post("/api/posts", async (req, res) => {
  try {
    await axios.post(`${API_URL}/posts`, req.body);
    res.redirect("/");
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).render("error.ejs", { message: "Error creating post" }); 
  }
});

app.post("/api/posts/:id", async (req, res) => {
  try {
    await axios.patch(`${API_URL}/posts/${req.params.id}`, req.body);
    res.redirect("/");
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).render("error.ejs", { message: "Error updating post" }); 
  }
});

app.get("/api/posts/delete/:id", async (req, res) => {
  try {
    await axios.delete(`${API_URL}/posts/${req.params.id}`);
    res.redirect("/");
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).render("error.ejs", { message: "Error deleting post" }); 
  }
});

app.listen(port, () => {
  console.log(`Frontend server is running on http://localhost:${port}`);
});
