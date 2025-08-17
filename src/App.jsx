import React, { useMemo, useState } from "react";
import Login from "./pages/Login.jsx";
import Editor from "./pages/Editor.jsx";

export default function App() {
  const [session, setSession] = useState(null);
  // session = { roomId, username }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {!session ? (
        <Login onJoin={(payload) => setSession(payload)} />
      ) : (
        <Editor session={session} onLeave={() => setSession(null)} />
      )}
    </div>
  );
}
