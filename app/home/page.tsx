"use client";

import { useEffect, useState } from "react";

import { ActiveSession } from "@/components/home/active-session";
import { TimerForm } from "@/components/home/timer-form";
import { DaySession } from "@/components/home/day-session";
import { db } from "@/lib/db/checkpoint-db";
import type { Session } from "@/lib/types/session";
import type { ActiveSession as ActiveSessionType } from "@/lib/types/session";

export default function Page() {
  const [gameName, setGameName] = useState("");
  const [activeSession, setActiveSession] = useState<ActiveSessionType | null>(
    null,
  );
  const [sessions, setSessions] = useState<Session[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    db.sessions
      .orderBy("start")
      .reverse()
      .toArray()
      .then((stored) => {
        if (!cancelled) {
          setSessions(stored);
        }
      })
      .catch((error) => {
        console.error("Failed to load sessions from IndexedDB", error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
    void db.sessions.put(finished).catch((error) => {
      console.error("Failed to save session", error);
    });
    setActiveSession(null);
    setNow(Date.now());
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">checkpoint</h1>
        <p className="text-gray-600">
          Track today’s gaming sessions so you can spot trends and set limits.
        </p>
      </header>

      <div className="space-y-4">
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
    </div>
  );
}
