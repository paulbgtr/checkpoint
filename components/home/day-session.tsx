import { useMemo } from "react";

import { formatDuration } from "@/lib/utils/format-duration";

type Props = {
  sessions: {
    id: string;
    game: string;
    start: number;
    end: number;
  }[];
};

const isSameDay = (a: Date, b: Date) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

export const DaySession = ({ sessions }: Props) => {
  const todaysSessions = useMemo(() => {
    const today = new Date();
    return sessions.filter((session) =>
      isSameDay(new Date(session.start), today),
    );
  }, [sessions]);

  return (
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
  );
};
