import { Session } from "@/lib/types/session";

export const mergeSessions = (current: Session[], incoming: Session[]) => {
  const merged = new Map<string, Session>();
  for (const session of current) {
    merged.set(session.id, session);
  }
  for (const session of incoming) {
    merged.set(session.id, session);
  }
  return Array.from(merged.values()).sort((a, b) => b.start - a.start);
};
