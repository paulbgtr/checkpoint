type Props = {
  gameName: string;
  setGameName: (name: string) => void;
  activeSession: {
    id: string;
    game: string;
    start: number;
  } | null;
  handleStart: () => void;
  handleStop: () => void;
};

export const TimerForm = ({
  gameName,
  setGameName,
  activeSession,
  handleStart,
  handleStop,
}: Props) => {
  return (
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
  );
};
