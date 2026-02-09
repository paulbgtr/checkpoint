import { useContext } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Session } from "@/lib/types/session";
import { AddSessionDialogContext } from "@/lib/context/add-session-dialog-context";
import { Button } from "../ui/button";

type AddSessionDialogProps = {
  upsertSession: (session: Session) => void;
};

export const AddSessionDialogTrigger = () => {
  const { openAddSessionDialog } = useContext(AddSessionDialogContext);

  return (
    <Button size="sm" onClick={openAddSessionDialog}>
      Add session
    </Button>
  );
};

export const AddSessionDialog = ({ upsertSession }: AddSessionDialogProps) => {
  const {
    open,
    setOpen,
    setError,
    game,
    start,
    end,
    intent,
    outcome,
    setIntent,
    setGame,
    setStart,
    setEnd,
    setOutcome,
    error,
  } = useContext(AddSessionDialogContext);

  const handleAddSession = () => {
    const trimmedGame = game.trim();
    const startMs = start ? new Date(start).getTime() : NaN;
    const endMs = end ? new Date(end).getTime() : NaN;
    if (!trimmedGame) {
      setError("Game title is required.");
      return;
    }
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
      setError("Start and end times are required.");
      return;
    }
    if (endMs <= startMs) {
      setError("End time must be after start time.");
      return;
    }

    const session: Session = {
      id: crypto.randomUUID(),
      game: trimmedGame,
      start: startMs,
      end: endMs,
      intent: intent.trim() ? intent.trim() : undefined,
      outcome: outcome.trim() ? outcome.trim() : undefined,
    };
    upsertSession(session);
    setOpen(false);
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setError(null);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add a session</AlertDialogTitle>
          <AlertDialogDescription>
            Log a session manually with times and notes.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="add-game-title">Game title</Label>
            <Input
              id="add-game-title"
              value={game}
              onChange={(event) => setGame(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-start-time">Start time</Label>
            <Input
              id="add-start-time"
              type="datetime-local"
              value={start}
              onChange={(event) => setStart(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-end-time">End time</Label>
            <Input
              id="add-end-time"
              type="datetime-local"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-intent">Intent</Label>
            <Textarea
              id="add-intent"
              value={intent}
              onChange={(event) => setIntent(event.target.value)}
              maxLength={240}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-outcome">Outcome</Label>
            <Textarea
              id="add-outcome"
              value={outcome}
              onChange={(event) => setOutcome(event.target.value)}
              maxLength={240}
              rows={3}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleAddSession}>
            Save session
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
