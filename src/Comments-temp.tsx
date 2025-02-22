import React, { useState, useEffect } from "react";

// Define the structure of a comment
interface Comment {
  id: number;
  username: string;
  content: string;
}

interface CommentsProps {
  user: string | null; // We receive the user as a prop
  imageId: string; // Image ID associated with the comments
}

const Comments: React.FC<CommentsProps> = ({ user, imageId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({ content: "" });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Function to fetch comments from the backend
  const fetchComments = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:5000/comments?imageId=${encodeURIComponent(imageId)}`);
      if (!response.ok) throw new Error("Error fetching comments");

      const data = await response.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(`Error loading comments: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments when component mounts or when imageId changes
  useEffect(() => {
    fetchComments();
  }, [imageId]);

  // Function to submit a new comment
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Include imageId and username in the comment before sending
    const commentWithImageId = { username: user, content: newComment.content, imageId };

    try {
      const response = await fetch("http://localhost:5000/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentWithImageId),
      });

      if (!response.ok) throw new Error("Error submitting the comment");

      await fetchComments(); // Reload comments
      setNewComment({ content: "" }); // Clear the form
    } catch (err) {
      setError(`Error adding the comment: ${err}`);
    }
  };

  return (
    <div className="comments">

      {loading && <p>Loading comments...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="comment-section">
          <label htmlFor="content">Comment:</label>
          <textarea
            id="content"
            value={newComment.content}
            onChange={(e) => setNewComment({ content: e.target.value })}
            required
          />
        </div>
        <button type="submit">Add comment</button>
      </form>

      <h2>Comments</h2>

      <ul>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <li key={comment.id}>
              <strong>{comment.username}:</strong> {comment.content}
            </li>
          ))
        ) : (
          <p>No comments available.</p>
        )}
      </ul>
    </div>
  );
};

export default Comments;
