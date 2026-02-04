import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import type { ActiveSession } from "@/lib/types/session";

type Props = {
  gameName: string;
  setGameName: (name: string) => void;
  intent: string;
  setIntent: (intent: string) => void;
  activeSession: ActiveSession | null;
  handleStart: () => void;
  handleStop: () => void;
};

export const TimerForm = ({
  gameName,
  setGameName,
  intent,
  setIntent,
  activeSession,
  handleStart,
  handleStop,
}: Props) => {
  return (
    <div className="space-y-3">
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

      <div className="space-y-2">
        <Label htmlFor="intent-note">Intent (optional, 10-30s)</Label>
        <Textarea
          id="intent-note"
          placeholder="What do you want to get out of this session?"
          value={intent}
          onChange={(event) => setIntent(event.target.value)}
          disabled={Boolean(activeSession)}
          maxLength={240}
          rows={3}
        />
      </div>
    </div>
  );
};
