"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { ActiveSession } from "@/components/home/active-session";
import { TimerForm } from "@/components/home/timer-form";
import { DaySession } from "@/components/home/day-session";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db/checkpoint-db";
import type { Session } from "@/lib/types/session";
import type { ActiveSession as ActiveSessionType } from "@/lib/types/session";

const buildExportFilename = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `checkpoint-sessions-${year}-${month}-${day}.json`;
};

const getSessionsArray = (payload: unknown) => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.sessions)) {
      return record.sessions;
    }
  }
  return null;
};

const isSessionLike = (value: unknown): value is Session => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.game === "string" &&
    Number.isFinite(record.start) &&
    Number.isFinite(record.end)
  );
};

const extractSessions = (payload: unknown) => {
  const rawSessions = getSessionsArray(payload);
  if (!rawSessions) {
    return null;
  }
  const validSessions = rawSessions.filter(isSessionLike);
  return {
    sessions: validSessions.map((session) => ({
      id: session.id,
      game: session.game,
      start: session.start,
      end: session.end,
    })),
    total: rawSessions.length,
    invalidCount: rawSessions.length - validSessions.length,
  };
};

const mergeSessions = (current: Session[], incoming: Session[]) => {
  const merged = new Map<string, Session>();
  for (const session of current) {
    merged.set(session.id, session);
  }
  for (const session of incoming) {
    merged.set(session.id, session);
  }
  return Array.from(merged.values()).sort((a, b) => b.start - a.start);
};

export default function Page() {
  const [gameName, setGameName] = useState("");
  const [activeSession, setActiveSession] = useState<ActiveSessionType | null>(
    null,
  );
  const [sessions, setSessions] = useState<Session[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleExport = () => {
    const payload = {
      version: 1,
      exportedAt: Date.now(),
      sessions,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = buildExportFilename();
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setImportMessage(null);
    let payload: unknown;
    try {
      payload = JSON.parse(await file.text());
    } catch (error) {
      console.error("Failed to parse import file", error);
      setImportMessage("Import failed: invalid JSON file.");
      event.target.value = "";
      return;
    }

    const extracted = extractSessions(payload);
    if (!extracted) {
      setImportMessage("Import failed: no sessions array found.");
      event.target.value = "";
      return;
    }

    if (extracted.total === 0) {
      setImportMessage("No sessions found in the import file.");
      event.target.value = "";
      return;
    }

    if (extracted.sessions.length === 0) {
      setImportMessage("Import failed: no valid sessions found.");
      event.target.value = "";
      return;
    }

    try {
      await db.sessions.bulkPut(extracted.sessions);
    } catch (error) {
      console.error("Failed to save imported sessions", error);
      setImportMessage("Import failed while saving to IndexedDB.");
      event.target.value = "";
      return;
    }

    setSessions((current) => mergeSessions(current, extracted.sessions));
    setImportMessage(
      extracted.invalidCount > 0
        ? `Imported ${extracted.sessions.length} sessions, skipped ${extracted.invalidCount} invalid.`
        : `Imported ${extracted.sessions.length} sessions.`,
    );
    event.target.value = "";
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8 space-y-3">
        <h1 className="text-3xl font-bold mb-2">checkpoint</h1>
        <p className="text-gray-600">
          Track today’s gaming sessions so you can spot trends and set limits.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            Export JSON
          </Button>
          <Button variant="outline" size="sm" onClick={handleImportClick}>
            Import JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImportChange}
          />
          {importMessage ? (
            <p className="text-sm text-muted-foreground">{importMessage}</p>
          ) : null}
        </div>
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
