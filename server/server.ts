import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2";

// Load environment variables
dotenv.config();

// Configure MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  database: process.env.MYSQL_DATABASE,
  password: process.env.MYSQLPASSWORD,
  port: Number(process.env.MYSQLPORT), // Default MySQL port is 3306
});

// Create the Express app
const app = express();
app.use(cors());
app.use(express.json()); // Enable JSON parsing in request bodies

// Define the interface for a comment
interface Comment {
  username: string;
  content: string;
  imageId?: string;
  id?: number;
}

// 🔹 Route to get comments filtered by imageId
app.get("/comments", async (req: Request, res: Response): Promise<void> => {
  const { imageId } = req.query; // Get imageId from query parameters

  let query = "SELECT * FROM comments WHERE 1=1"; // Base query

  // If imageId is provided, filter comments by it
  if (imageId) {
    query += ` AND image_id = ?`;
  }

  try {
    pool.query(query, [imageId], (error, results) => {
      if (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ error: "Internal server error" });
      } else {
        res.json(results);
      }
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 Route to add a new comment
app.post("/comments", async (req: Request, res: Response): Promise<void> => {
  const { username, content, imageId } = req.body;

  // Validate required fields
  if (!username || !content) {
    res.status(400).json({ error: "Missing data" });
    return;
  }

  // Validate comment length
  if (content.length < 5) {
    res.status(400).json({ error: "Comment must be at least 5 characters long" });
    return;
  }

  try {
    // Insert the new comment into the database
    const [result]: any = await pool.promise().execute(
      "INSERT INTO comments (username, content, image_id) VALUES (?, ?, ?)",
      [username, content, imageId]
    );

    // Fetch the newly inserted comment
    const [newComment]: any = await pool.promise().execute(
      "SELECT * FROM comments WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(newComment[0]); // Return the newly created comment
  } catch (error) {
    console.error("Error inserting comment:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});