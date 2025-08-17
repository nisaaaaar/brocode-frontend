import React from "react";

export default function Members({ members, me }) {
  return (
    <div style={styles.container}>
      {/* <h4 style={styles.title}>👥 Members</h4> */}
      <div style={styles.list}>
        {members.map((m) => {
          const isMe = m.sid === me?.sid;
          return (
            <div key={m.sid} style={styles.memberCard}>
              {/* Avatar */}
              <div style={{ ...styles.avatar, background: m.color || "#888" }}>
                {m.username?.charAt(0).toUpperCase() || "?"}
              </div>

              {/* Name + Status */}
              <div style={styles.memberInfo}>
                <span
                  style={{
                    ...styles.username,
                    fontWeight: isMe ? "bold" : "normal",
                    color: isMe ? "#61dafb" : "#fff",
                  }}
                >
                  {m.username} {isMe && "(You)"}
                </span>
                <span style={styles.status}>
                  <span style={{ ...styles.dot, background: "#4caf50" }} />{" "}
                  Online
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    height: "93.9vh",
    padding: "12px",
    background: "#111",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    margin: "0 0 12px 0",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#bbb",
    borderBottom: "1px solid #333",
    paddingBottom: "6px",
  },
  list: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    overflowY: "auto",
  },
  memberCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px",
    borderRadius: "8px",
    background: "#2a2a2a",
    border: "1px solid #333",
    transition: "background 0.2s ease",
    cursor: "default",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "bold",
    textTransform: "uppercase",
    flexShrink: 0,
  },
  memberInfo: {
    display: "flex",
    flexDirection: "column",
  },
  username: {
    fontSize: "14px",
  },
  status: {
    fontSize: "12px",
    color: "#aaa",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    display: "inline-block",
  },
};
