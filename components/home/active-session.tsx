import { formatDuration } from "@/lib/utils/format-duration";

type Props = {
  activeSession: {
    id: string;
    game: string;
    start: number;
  } | null;
  now: number;
};

export const ActiveSession = ({ activeSession, now }: Props) => {
  const activeElapsed = activeSession ? now - activeSession.start : 0;

  return (
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
  );
};
