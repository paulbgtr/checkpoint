import { Input } from "../ui/input";
import { Button } from "../ui/button";

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
    <div className="flex gap-2">
      <Input
        type="text"
        placeholder="Enter game title"
        value={gameName}
        onChange={(event) => setGameName(event.target.value)}
        disabled={Boolean(activeSession)}
      />
      {!activeSession ? (
        <Button onClick={handleStart} disabled={!gameName.trim()}>
          Start timer
        </Button>
      ) : (
        <Button variant="destructive" onClick={handleStop}>
          Stop timer
        </Button>
      )}
    </div>
  );
};
