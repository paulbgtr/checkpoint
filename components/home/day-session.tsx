import { useMemo } from "react";

import { Card, CardHeader, CardFooter, CardTitle } from "../ui/card";
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
    <section>
      <h2 className="text-xl">Today’s sessions ({todaysSessions.length})</h2>
      {todaysSessions.length === 0 ? (
        <p className="text-muted-foreground">No sessions logged yet.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {todaysSessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <CardTitle>{session.game}</CardTitle>

                <div>
                  {new Date(session.start).toLocaleTimeString()} -{" "}
                  {new Date(session.end).toLocaleTimeString()}
                </div>
              </CardHeader>

              <CardFooter>
                Duration: {formatDuration(session.end - session.start)}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};
