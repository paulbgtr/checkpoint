"use client";

import { useEffect, useState } from "react";

import { ActiveSession } from "@/components/home/active-session";
import { TimerForm } from "@/components/home/timer-form";
import { DaySession } from "@/components/home/day-session";

type Session = {
  id: string;
  game: string;
  start: number;
  end: number;
};

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

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>checkpoint</h1>
      <p style={{ marginTop: 0, color: "#444" }}>
        Track today’s gaming sessions so you can spot trends and set limits.
      </p>

      <TimerForm
        gameName={gameName}
        setGameName={setGameName}
        activeSession={activeSession}
        handleStart={handleStart}
        handleStop={handleStop}
      />

      <ActiveSession activeSession={activeSession} now={now} />

      <DaySession sessions={sessions} />
    </div>
  );
}
