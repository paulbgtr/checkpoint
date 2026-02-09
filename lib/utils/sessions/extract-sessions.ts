import { Session } from "@/lib/types/session";

const isSessionLike = (value: unknown): value is Session => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  const intentValid =
    record.intent === undefined || typeof record.intent === "string";
  const outcomeValid =
    record.outcome === undefined || typeof record.outcome === "string";
  return (
    typeof record.id === "string" &&
    typeof record.game === "string" &&
    Number.isFinite(record.start) &&
    Number.isFinite(record.end) &&
    intentValid &&
    outcomeValid
  );
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

export const extractSessions = (payload: unknown) => {
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
      intent: session.intent,
      outcome: session.outcome,
    })),
    total: rawSessions.length,
    invalidCount: rawSessions.length - validSessions.length,
  };
};
