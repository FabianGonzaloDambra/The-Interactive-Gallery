import React, { useState, useEffect } from "react";

// Define the structure of a comment
interface Comment {
  id: number;
  username: string;
  content: string;
}

interface CommentsProps {
  imageId: string;
}

const Comments: React.FC<CommentsProps> = ({ imageId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({ username: "", content: "" });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // 🔹 Function to fetch comments
  const fetchComments = async () => {
    setLoading(true);
    setError("");
  
    try {
      const response = await fetch(`http://localhost:5000/comments?imageId=${encodeURIComponent(imageId)}`);
      if (!response.ok) throw new Error("Error fetching comments");
  
      const data = await response.json();
      if (Array.isArray(data)) {
        setComments(data);
      } else {
        setComments([]);
      }
    } catch (err) {
      setError(`Error loading comments: ${err}`);
    } finally {
      setLoading(false);
    }
  };
  
  // 🔹 Load comments when the component mounts (incluso si imageId cambia)
  useEffect(() => {
    fetchComments();
  }, [imageId]);  // Ahora depende de imageId

  // 🔹 Function to submit a new comment
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    // Incluimos imageId en el objeto que vamos a enviar
    const commentWithImageId = { ...newComment, imageId };
    
    try {
      const response = await fetch("http://localhost:5000/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentWithImageId), // Enviamos el comentario con el imageId
      });
  
      if (!response.ok) throw new Error("Error submitting the comment");
  
      await fetchComments(); // Recargar los comentarios del backend
      setNewComment({ username: "", content: "" }); // Limpiar el formulario
    } catch (err) {
      setError(`Error adding the comment: ${err}`);
    }
  };

  return (
    <div>
      <h2>Comments</h2>

      {loading && <p>Loading comments...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Display comments */}
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

      {/* Form to add a new comment */}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={newComment.username}
            onChange={(e) => setNewComment({ ...newComment, username: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="content">Comment:</label>
          <textarea
            id="content"
            value={newComment.content}
            onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
            required
          />
        </div>
        <button type="submit">Add comment</button>
      </form>
    </div>
  );
};

export default Comments;
