import { formatDuration } from "@/lib/utils/format-duration";
import { Card, CardHeader, CardFooter, CardTitle } from "../ui/card";
import type { ActiveSession as ActiveSessionType } from "@/lib/types/session";

type Props = {
  activeSession: ActiveSessionType | null;
  now: number;
};

export const ActiveSession = ({ activeSession, now }: Props) => {
  const activeElapsed = activeSession ? now - activeSession.start : 0;

  return (
    <section>
      <h2 className="text-xl">Current session</h2>

      {activeSession ? (
        <div className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{activeSession.game}</CardTitle>
              <div className="text-muted-foreground">
                Started at {new Date(activeSession.start).toLocaleTimeString()}
              </div>
            </CardHeader>
            <CardFooter>Elapsed: {formatDuration(activeElapsed)}</CardFooter>
          </Card>
        </div>
      ) : (
        <p className="text-muted-foreground">No active timer.</p>
      )}
    </section>
  );
};
