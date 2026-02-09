"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { ActiveSession } from "@/components/home/active-session";
import { TimerForm } from "@/components/home/timer-form";
import { DaySession } from "@/components/home/day-session";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db/checkpoint-db";
import type { Session } from "@/lib/types/session";
import type { ActiveSession as ActiveSessionType } from "@/lib/types/session";
import { AddSessionDialog } from "@/components/home/add-session-dialog";
import { CheckoutDialog } from "@/components/home/checkout-dialog";
import { mergeSessions } from "@/lib/utils/sessions/merge-sessions";
import { extractSessions } from "@/lib/utils/sessions/extract-sessions";

const buildExportFilename = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `checkpoint-sessions-${year}-${month}-${day}.json`;
};

const toLocalInputValue = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function Page() {
  const [gameName, setGameName] = useState("");
  const [intent, setIntent] = useState("");
  const [activeSession, setActiveSession] = useState<ActiveSessionType | null>(
    null,
  );
  const [sessions, setSessions] = useState<Session[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [pendingSession, setPendingSession] = useState<Session | null>(null);
  const [outcome, setOutcome] = useState("");
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addGame, setAddGame] = useState("");
  const [addStart, setAddStart] = useState("");
  const [addEnd, setAddEnd] = useState("");
  const [addIntent, setAddIntent] = useState("");
  const [addOutcome, setAddOutcome] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

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
    if (!trimmed || activeSession || pendingSession) {
      return;
    }
    const trimmedIntent = intent.trim();
    setActiveSession({
      id: crypto.randomUUID(),
      game: trimmed,
      start: Date.now(),
      intent: trimmedIntent ? trimmedIntent : undefined,
    });
    setIntent("");
  };

  const upsertSession = (session: Session) => {
    setSessions((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === session.id);
      if (existingIndex === -1) {
        return [session, ...prev];
      }
      const next = [...prev];
      next[existingIndex] = session;
      return next;
    });
    void db.sessions.put(session).catch((error) => {
      console.error("Failed to save session", error);
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
      intent: activeSession.intent,
    };
    upsertSession(finished);
    setActiveSession(null);
    setNow(Date.now());
    setOutcome("");
    setPendingSession(finished);
  };

  const handleOutcomeSave = () => {
    if (!pendingSession) {
      return;
    }
    const trimmedOutcome = outcome.trim();
    const finished = {
      ...pendingSession,
      outcome: trimmedOutcome ? trimmedOutcome : undefined,
    };
    upsertSession(finished);
    setPendingSession(null);
    setOutcome("");
  };

  const handleOutcomeSkip = () => {
    if (!pendingSession) {
      return;
    }
    setPendingSession(null);
    setOutcome("");
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId));
    if (pendingSession?.id === sessionId) {
      setPendingSession(null);
      setOutcome("");
    }
    void db.sessions.delete(sessionId).catch((error) => {
      console.error("Failed to delete session", error);
    });
  };

  const handleEditSession = (session: Session) => {
    upsertSession(session);
    if (pendingSession?.id === session.id) {
      setPendingSession(session);
    }
  };

  const handleOpenAdd = () => {
    const end = new Date();
    const start = new Date(end.getTime() - 60 * 60 * 1000);
    setAddGame("");
    setAddStart(toLocalInputValue(start));
    setAddEnd(toLocalInputValue(end));
    setAddIntent("");
    setAddOutcome("");
    setAddError(null);
    setAddOpen(true);
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
          <Button size="sm" onClick={handleOpenAdd}>
            Add session
          </Button>
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
          intent={intent}
          setIntent={setIntent}
          activeSession={activeSession}
          startDisabled={Boolean(pendingSession)}
          handleStart={handleStart}
          handleStop={handleStop}
        />

        <ActiveSession activeSession={activeSession} now={now} />

        <DaySession
          sessions={sessions}
          onDelete={handleDeleteSession}
          onEdit={handleEditSession}
        />
      </div>

      <CheckoutDialog
        pendingSession={pendingSession}
        outcome={outcome}
        setOutcome={setOutcome}
        handleOutcomeSave={handleOutcomeSave}
        handleOutcomeSkip={handleOutcomeSkip}
      />

      <AddSessionDialog
        addOpen={addOpen}
        setAddOpen={setAddOpen}
        addGame={addGame}
        setAddGame={setAddGame}
        addStart={addStart}
        setAddStart={setAddStart}
        addEnd={addEnd}
        setAddEnd={setAddEnd}
        addIntent={addIntent}
        setAddIntent={setAddIntent}
        addOutcome={addOutcome}
        setAddOutcome={setAddOutcome}
        addError={addError}
        setAddError={setAddError}
        upsertSession={upsertSession}
      />
    </div>
  );
}
