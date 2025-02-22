import React, { useState } from "react";

// Define the props for AuthApp
interface AuthAppProps {
  user: string | null;
  setUser: React.Dispatch<React.SetStateAction<string | null>>;
}

const AuthApp: React.FC<AuthAppProps> = ({ user, setUser }) => {
  const [username, setUsername] = useState("");

  // Handle user login
  const handleLogin = () => {
    if (username.trim() === "") {
      alert("Please enter a username");
      return;
    }
    localStorage.setItem("user", username); // Store user in localStorage
    setUser(username); // Update the user state in the parent component
  };

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem("user"); // Remove user from localStorage
    setUser(null); // Clear the user state in the parent component
  };

  return (
    <div>
      <h2>User Authentication</h2>
      {user ? (
        <div>
          <p>Welcome, {user}!</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      )}
    </div>
  );
};

export default AuthApp;
