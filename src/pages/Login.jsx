import React, { useState, useEffect } from "react";
import { socket } from "../socket";
import { v4 as uuidv4 } from "uuid";

export default function Login({ onJoin }) {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  // Setup socket listeners once
  useEffect(() => {
    // Triggered when backend confirms join
    socket.on("joined", (data) => {
      onJoin({ roomId: data.roomId, username: data.username });
    });

    // Handle server errors
    socket.on("error", (e) => {
      alert(e?.message || "Failed to join room");
    });

    // Optional: debug socket connection
    socket.on("connect", () => console.log("Socket connected!"));
    socket.on("disconnect", () => console.log("Socket disconnected"));

    // Cleanup listeners on unmount
    return () => {
      socket.off("joined");
      socket.off("error");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [onJoin]);

  // Generate random Room ID
  const generateRoomId = () => setRoomId(uuidv4());

  // Emit join event
  const handleJoin = () => {
    if (!roomId.trim()) return alert("Enter Room ID");
    if (!socket.connected) socket.connect();

    socket.emit("join", {
      roomId: roomId.trim(),
      username: username.trim() || "Guest",
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>💻 BroCode</h1>
        <p style={styles.subtitle}>Collaborative Code Editor</p>

        <label style={styles.label}>Room ID</label>
        <div style={styles.row}>
          <input
            style={styles.input}
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter or generate Room ID"
          />
          <button type="button" onClick={generateRoomId} style={styles.secondaryBtn}>
            Generate
          </button>
        </div>

        <label style={styles.label}>Username</label>
        <input
          style={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g., Nisar"
        />

        <button onClick={handleJoin} style={styles.primaryBtn}>
          🚀 Join Room
        </button>
      </div>
    </div>
  );
}

// Styles (same as before)
const styles = {
  container: {
    height: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    fontFamily: "Segoe UI, sans-serif",
  },
  card: {
    width: 380,
    padding: 28,
    borderRadius: 12,
    background: "#1e1e1e",
    color: "#fff",
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
  },
  title: {
    margin: "0 0 4px 0",
    fontSize: 28,
    textAlign: "center",
    color: "#61dafb",
    fontWeight: "bold",
  },
  subtitle: {
    margin: "0 0 20px 0",
    fontSize: 14,
    textAlign: "center",
    color: "#bbb",
  },
  label: {
    fontSize: 13,
    color: "#ccc",
    marginTop: 12,
    display: "block",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid #444",
    background: "#2b2b2b",
    color: "#fff",
    marginTop: 6,
    marginBottom: 10,
    outline: "none",
  },
  row: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  primaryBtn: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    background: "#61dafb",
    color: "#000",
    fontWeight: "bold",
    marginTop: 16,
    transition: "all 0.2s",
  },
  secondaryBtn: {
    padding: "10px 14px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    background: "#444",
    color: "#fff",
    fontWeight: "bold",
    whiteSpace: "nowrap",
    transition: "all 0.2s",
  },
};
