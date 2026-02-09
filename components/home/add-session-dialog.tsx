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

type Props = {
  addOpen: boolean;
  setAddOpen: (open: boolean) => void;
  setAddError: (error: string | null) => void;
  addGame: string;
  addStart: string;
  addEnd: string;
  addIntent: string;
  addOutcome: string;
  upsertSession: (session: Session) => void;
  setAddIntent: (intent: string) => void;
  setAddGame: (game: string) => void;
  setAddStart: (start: string) => void;
  setAddEnd: (end: string) => void;
  setAddOutcome: (outcome: string) => void;
  addError: string | null;
};

export const AddSessionDialog = ({
  setAddOpen,
  addStart,
  addEnd,
  addGame,
  addIntent,
  addOutcome,
  addOpen,
  setAddError,
  upsertSession,
  setAddIntent,
  setAddGame,
  setAddStart,
  setAddEnd,
  setAddOutcome,
  addError,
}: Props) => {
  const handleAddSession = () => {
    const trimmedGame = addGame.trim();
    const startMs = addStart ? new Date(addStart).getTime() : NaN;
    const endMs = addEnd ? new Date(addEnd).getTime() : NaN;
    if (!trimmedGame) {
      setAddError("Game title is required.");
      return;
    }
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
      setAddError("Start and end times are required.");
      return;
    }
    if (endMs <= startMs) {
      setAddError("End time must be after start time.");
      return;
    }

    const session: Session = {
      id: crypto.randomUUID(),
      game: trimmedGame,
      start: startMs,
      end: endMs,
      intent: addIntent.trim() ? addIntent.trim() : undefined,
      outcome: addOutcome.trim() ? addOutcome.trim() : undefined,
    };
    upsertSession(session);
    setAddOpen(false);
  };

  return (
    <AlertDialog
      open={addOpen}
      onOpenChange={(nextOpen) => {
        setAddOpen(nextOpen);
        if (!nextOpen) {
          setAddError(null);
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
              value={addGame}
              onChange={(event) => setAddGame(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-start-time">Start time</Label>
            <Input
              id="add-start-time"
              type="datetime-local"
              value={addStart}
              onChange={(event) => setAddStart(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-end-time">End time</Label>
            <Input
              id="add-end-time"
              type="datetime-local"
              value={addEnd}
              onChange={(event) => setAddEnd(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-intent">Intent</Label>
            <Textarea
              id="add-intent"
              value={addIntent}
              onChange={(event) => setAddIntent(event.target.value)}
              maxLength={240}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-outcome">Outcome</Label>
            <Textarea
              id="add-outcome"
              value={addOutcome}
              onChange={(event) => setAddOutcome(event.target.value)}
              maxLength={240}
              rows={3}
            />
          </div>
          {addError ? (
            <p className="text-sm text-destructive">{addError}</p>
          ) : null}
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
