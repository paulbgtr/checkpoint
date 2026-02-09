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
import { Textarea } from "../ui/textarea";
import { Session } from "@/lib/types/session";

type Props = {
  pendingSession: Session | null;
  outcome: string;
  setOutcome: (outcome: string) => void;
  handleOutcomeSave: () => void;
  handleOutcomeSkip: () => void;
};

export const CheckoutDialog = ({
  pendingSession,
  outcome,
  setOutcome,
  handleOutcomeSave,
  handleOutcomeSkip,
}: Props) => {
  return (
    <AlertDialog open={Boolean(pendingSession)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Quick check-out</AlertDialogTitle>
          <AlertDialogDescription>
            What actually happened in this session?
          </AlertDialogDescription>
        </AlertDialogHeader>

        {pendingSession?.intent ? (
          <p className="text-muted-foreground text-sm whitespace-pre-line">
            <span className="text-foreground font-medium">Intent:</span>{" "}
            {pendingSession.intent}
          </p>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="outcome-note">Outcome (optional)</Label>
          <Textarea
            id="outcome-note"
            placeholder="What did you actually do or learn?"
            value={outcome}
            onChange={(event) => setOutcome(event.target.value)}
            maxLength={240}
            rows={3}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleOutcomeSkip}>
            Skip
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleOutcomeSave}
            disabled={!outcome.trim()}
          >
            Save outcome
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
