import React, { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import Editor, { useMonaco } from "@monaco-editor/react";
import Members from "../components/Members.jsx";

export default function EditorPage({ session, onLeave }) {
  const monaco = useMonaco();
  const editorRef = useRef(null);
  const decorationsRef = useRef({});
  const applyingRemoteRef = useRef(false);

  const [me, setMe] = useState(null);
  const [members, setMembers] = useState([]);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [notification, setNotification] = useState(null);

  // Sidebar: open on desktop, closed on mobile
  const [showSidebar, setShowSidebar] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth > 900;
  });

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const onJoined = (data) => {
      setCode(data.code || "");
      setMembers(data.members || []);
      setMe({ sid: data.sid, username: data.username, color: data.color });
    };

    const onMemberJoined = (m) => {
      setMembers((prev) => [...prev, m]);
      showNotification(`🎉 ${m.username} joined the room`);
    };

    const onMemberLeft = (m) => {
      setMembers((prev) => prev.filter((x) => x.sid !== m.sid));
      showNotification(`👋 ${m.username} left the room`);
    };

    const onCodeUpdate = ({ code }) => {
      if (editorRef.current) {
        applyingRemoteRef.current = true;
        editorRef.current.setValue(code);
        applyingRemoteRef.current = false;
      }
      setCode(code);
    };

    const onCursorUpdate = ({ sid, username, color, position }) => {
      if (!editorRef.current || !monaco) return;
      const model = editorRef.current.getModel();
      if (!model) return;

      if (decorationsRef.current[sid]) {
        editorRef.current.deltaDecorations(decorationsRef.current[sid], []);
      }

      const range = new monaco.Range(
        position.lineNumber,
        position.column,
        position.lineNumber,
        position.column
      );

      ensureCursorCss(sid, color, username);

      const newDecos = editorRef.current.deltaDecorations([], [
        {
          range,
          options: {
            className: `remote-cursor-${sid}`,
            stickiness: 1,
            after: {
              content: ` ${username}`,
              inlineClassName: `remote-cursor-label-${sid}`,
            },
          },
        },
      ]);
      decorationsRef.current[sid] = newDecos;
    };

    socket.on("joined", onJoined);
    socket.on("member_joined", onMemberJoined);
    socket.on("member_left", onMemberLeft);
    socket.on("code_update", onCodeUpdate);
    socket.on("cursor_update", onCursorUpdate);

    socket.emit("join", { roomId: session.roomId, username: session.username });

    return () => {
      socket.emit("leave", { roomId: session.roomId });
      socket.off("joined", onJoined);
      socket.off("member_joined", onMemberJoined);
      socket.off("member_left", onMemberLeft);
      socket.off("code_update", onCodeUpdate);
      socket.off("cursor_update", onCursorUpdate);
    };
  }, [session.roomId, session.username, monaco]);

  const handleChange = (value) => {
    setCode(value);
    if (applyingRemoteRef.current) return;
    socket.emit("code_change", {
      roomId: session.roomId,
      code: value,
      originSid: me?.sid,
    });
  };

  const handleMount = (editor) => {
    editorRef.current = editor;
    const sendCursor = () => {
      const position = editor.getPosition();
      if (!position) return;
      socket.emit("cursor_move", {
        roomId: session.roomId,
        position: { lineNumber: position.lineNumber, column: position.column },
      });
    };
    editor.onDidChangeCursorPosition(sendCursor);
    editor.onDidChangeCursorSelection(sendCursor);
    sendCursor();
  };

  const leaveRoom = () => {
    socket.emit("leave", { roomId: session.roomId });
    onLeave();
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(session.roomId).then(() => {
      showNotification("📋 Room ID copied!");
    });
  };

  return (
    <div className="editor-container">
      <style>{`
        :root {
          --bg: #1e1e1e;
          --panel: #111;
          --muted: #999;
          --border: #222;
          --brand: #61dafb;
          --btn: #2b2b2b;
          --btn-hover: #3a3a3a;
          --danger: #e74c3c;
          --shadow: 0 10px 30px rgba(0,0,0,.35);
        }
        * { box-sizing: border-box; }

        .editor-container {
          display: flex;
          height: 100vh;
          width: 100%;
          position: relative;
          background: var(--bg);
          color: #fff;
          overflow: hidden;
          font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial;
        }

        .editor-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .topbar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-bottom: 1px solid var(--border);
          background: var(--panel);
        }

        .logo {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
          color: var(--brand);
          letter-spacing: .3px;
        }

        .pill {
          font-size: 12px;
          color: var(--muted);
          border: 1px solid var(--border);
          padding: 4px 8px;
          border-radius: 6px;
          white-space: nowrap;
        }

        .btn {
          background: var(--btn);
          border: 1px solid var(--border);
          color: #fff;
          padding: 8px 10px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }
        .btn:hover { background: var(--btn-hover); }
        .btn-icon { padding: 8px 10px; line-height: 1; }
        .btn-danger {
          background: var(--danger);
          border-color: #c0392b;
        }
        .btn-danger:hover { filter: brightness(0.95); }

        .controls {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-left: auto;
        }

        select {
          background: #2b2b2b;
          color: #fff;
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 6px 8px;
          font-size: 13px;
        }

        .editor-wrapper {
          flex: 1;
          display: flex;
          min-width: 0;
        }

        /* Sidebar */
        .sidebar {
          width: 260px;
          border-left: 1px solid var(--border);
          background: #0f0f0f;
          color: #fff;
          overflow-y: auto;
          box-shadow: var(--shadow);
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-bottom: 1px solid var(--border);
          font-weight: 700;
        }
        .close-btn {
          background: transparent;
          border: none;
          color: #fff;
          font-size: 18px;
          cursor: pointer;
          line-height: 1;
        }

        .member {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-bottom: 1px solid #1f1f1f;
          transition: background .2s;
        }
        .member:hover {
          background: rgba(255,255,255,.05);
        }
        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: bold;
          text-transform: uppercase;
          flex-shrink: 0;
        }
        .member-name {
          font-size: 14px;
        }
        .member-me {
          font-weight: bold;
          color: var(--brand);
        }

        .toast {
          position: absolute;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          background: #2a2a2a;
          color: #fff;
          padding: 8px 12px;
          border-radius: 8px;
          box-shadow: var(--shadow);
          z-index: 1000;
          font-size: 14px;
          border: 1px solid var(--border);
        }

        /* Responsive Sidebar */
        @media (min-width: 901px) {
          .sidebar.hidden { display: none; }
        }
        @media (max-width: 900px) {
          .sidebar {
            position: absolute;
            right: 0;
            top: 0;
            bottom: 0;
            width: 80vw;
            max-width: 280px;
            transform: translateX(100%);
            transition: transform .28s ease;
            z-index: 200;
          }
          .sidebar.open { transform: translateX(0); }
          .sidebar.hidden { transform: translateX(100%); }
          .backdrop {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,.45);
            z-index: 150;
          }
          .topbar { flex-wrap: wrap; gap: 10px; }
          .pill { order: 3; }
        }
      `}</style>

      {/* 🔔 Toast */}
      {notification && <div className="toast">{notification}</div>}

      {/* Mobile backdrop */}
      {showSidebar && <div className="backdrop" onClick={() => setShowSidebar(false)} />}

      <div className="editor-main">
        {/* Top bar */}
        <div className="topbar">
          <h2 className="logo">💻 BroCode</h2>

          <div className="pill"><strong>Room:</strong> {session.roomId} <button className="btn" onClick={copyRoomId}>📋 Copy</button></div>
          

          <div className="controls">
            <label>Language:</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option>javascript</option>
              <option>typescript</option>
              <option>python</option>
              <option>cpp</option>
              <option>java</option>
              <option>json</option>
              <option>markdown</option>
            </select>
            <button className="btn btn-danger" onClick={leaveRoom}>Leave</button>
            <button
              className="btn btn-icon"
              onClick={() => setShowSidebar((s) => !s)}
              title="Toggle members"
            >
              👥
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="editor-wrapper">
          <Editor
            height="100%"
            theme="vs-dark"
            language={language}
            value={code}
            onChange={handleChange}
            onMount={handleMount}
            options={{ minimap: { enabled: false }, smoothScrolling: true, automaticLayout: true }}
          />
        </div>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${showSidebar ? "open" : "hidden"}`}>
        <div className="sidebar-header">
          <span>👥 Members</span>
          <button className="close-btn" onClick={() => setShowSidebar(false)}>✖</button>
        </div>
        {members.map((m) => {
          const isMe = m.sid === me?.sid;
          return (
            <div className="member" key={m.sid}>
              <div className="avatar" style={{ background: m.color || "#888" }}>
                {m.username?.charAt(0) || "?"}
              </div>
              <span className={`member-name ${isMe ? "member-me" : ""}`}>
                {m.username} {isMe && "(You)"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ensureCursorCss(sid, color, username) {
  const id = `cursor-style-${sid}`;
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.innerHTML = `
    .remote-cursor-${sid} {
      border-left: 2px solid ${color};
    }
    .remote-cursor-label-${sid} {
      border: 1px solid ${color};
      background: rgba(0,0,0,0.6);
      padding: 0 4px;
      border-radius: 3px;
      font-size: 10px;
      margin-left: 3px;
    }
  `;
  document.head.appendChild(style);
}
