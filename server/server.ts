import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2";

// Load environment variables
dotenv.config();

// Configure MySQL connection
const pool = mysql.createPool({
  host: process.env.MS_HOST,
  user: process.env.MS_USER,
  database: process.env.MS_DATABASE,
  password: process.env.MS_PASSWORD,
  port: Number(process.env.MS_PORT), // MySQL default port is usually 3306
});

// Create the Express app
const app = express();
app.use(cors());
app.use(express.json()); // To receive JSON in requests

// Define the interface for the comment request body
interface Comment {
  username: string;
  content: string;
  id?: number;
}

// Route to get comments
app.get("/comments", async (req: Request, res: Response): Promise<void> => {
  try {
    pool.query("SELECT * FROM comments ORDER BY created_at DESC", (error, results) => {
      if (error) {
        console.error("Error fetching comments", error);
        res.status(500).json({ error: "Internal server error" });
      } else {
        res.json(results);
      }
    });
  } catch (error) {
    console.error("Error fetching comments", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to add a comment
app.post("/comments", async (req: Request, res: Response): Promise<void> => {
  const { username, content, imageId } = req.body;

  // Check if both username and content are provided
  if (!username || !content) {
    res.status(400).json({ error: "Missing data" });
    return;
  }

  try {
    // Insert the comment
    const [result]: any = await pool.promise().execute(
      "INSERT INTO comments (username, content, imageId) VALUES (?, ?, ?)",
      [username, content, imageId]
    );

    // Fetch the newly inserted comment
    const [newComment]: any = await pool.promise().execute(
      "SELECT * FROM comments WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(newComment[0]);
  } catch (error) {
    console.error("Error inserting comment:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
