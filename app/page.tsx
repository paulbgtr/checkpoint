"use client";

import { useEffect, useMemo, useState } from "react";

type Session = {
  id: string;
  game: string;
  start: number;
  end: number;
};

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function Page() {
  const [gameName, setGameName] = useState("");
  const [activeSession, setActiveSession] = useState<{
    id: string;
    game: string;
    start: number;
  } | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!activeSession) {
      return;
    }
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(interval);
  }, [activeSession]);

  const todaysSessions = useMemo(() => {
    const today = new Date();
    return sessions.filter((session) =>
      isSameDay(new Date(session.start), today),
    );
  }, [sessions]);

  const handleStart = () => {
    const trimmed = gameName.trim();
    if (!trimmed || activeSession) {
      return;
    }
    setActiveSession({
      id: crypto.randomUUID(),
      game: trimmed,
      start: Date.now(),
    });
  };

  const handleStop = () => {
    if (!activeSession) {
      return;
    }
    const finished: Session = {
      id: activeSession.id,
      game: activeSession.game,
      start: activeSession.start,
      end: Date.now(),
    };
    setSessions((prev) => [finished, ...prev]);
    setActiveSession(null);
    setNow(Date.now());
  };

  const activeElapsed = activeSession ? now - activeSession.start : 0;

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>checkpoint</h1>
      <p style={{ marginTop: 0, color: "#444" }}>
        Track today’s gaming sessions so you can spot trends and set limits.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          marginTop: 24,
        }}
      >
        <input
          type="text"
          placeholder="Enter game title"
          value={gameName}
          onChange={(event) => setGameName(event.target.value)}
          disabled={Boolean(activeSession)}
          style={{
            flex: "1 1 220px",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />
        {!activeSession ? (
          <button
            type="button"
            onClick={handleStart}
            disabled={!gameName.trim()}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #111",
              background: gameName.trim() ? "#111" : "#555",
              color: "#fff",
              cursor: gameName.trim() ? "pointer" : "not-allowed",
            }}
          >
            Start timer
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStop}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #c23",
              background: "#c23",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Stop timer
          </button>
        )}
      </div>

      <section style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>Current session</h2>
        {activeSession ? (
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              border: "1px solid #e5e5e5",
              background: "#fafafa",
            }}
          >
            <div style={{ fontWeight: 600 }}>{activeSession.game}</div>
            <div style={{ color: "#333", marginTop: 4 }}>
              Started at {new Date(activeSession.start).toLocaleTimeString()}
            </div>
            <div style={{ marginTop: 8 }}>
              Elapsed: {formatDuration(activeElapsed)}
            </div>
          </div>
        ) : (
          <p style={{ color: "#666" }}>No active timer.</p>
        )}
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, marginBottom: 12 }}>
          Today’s sessions ({todaysSessions.length})
        </h2>
        {todaysSessions.length === 0 ? (
          <p style={{ color: "#666" }}>No sessions logged yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {todaysSessions.map((session) => (
              <div
                key={session.id}
                style={{
                  borderRadius: 12,
                  border: "1px solid #e5e5e5",
                  padding: 14,
                }}
              >
                <div style={{ fontWeight: 600 }}>{session.game}</div>
                <div style={{ color: "#444", marginTop: 4 }}>
                  {new Date(session.start).toLocaleTimeString()} -{" "}
                  {new Date(session.end).toLocaleTimeString()}
                </div>
                <div style={{ marginTop: 6 }}>
                  Duration: {formatDuration(session.end - session.start)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
