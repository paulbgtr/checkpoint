"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardHeader, CardFooter, CardTitle } from "../ui/card";
import { DayNavigation } from "./day-navigation";
import { formatDuration } from "@/lib/utils/format-duration";
import { getDayKey } from "@/lib/utils/get-day-key";

type Props = {
  sessions: {
    id: string;
    game: string;
    start: number;
    end: number;
  }[];
};

export const DaySession = ({ sessions }: Props) => {
  const [todayKey, setTodayKey] = useState(() => getDayKey(new Date()));
  const [selectedDayKey, setSelectedDayKey] = useState(() =>
    getDayKey(new Date()),
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      const nextTodayKey = getDayKey(new Date());
      setTodayKey((current) => {
        if (current === nextTodayKey) {
          return current;
        }
        setSelectedDayKey((selected) =>
          selected === current ? nextTodayKey : selected,
        );
        return nextTodayKey;
      });
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  const daySessions = useMemo(() => {
    return sessions.filter(
      (session) => getDayKey(new Date(session.start)) === selectedDayKey,
    );
  }, [sessions, selectedDayKey]);

  return (
    <section>
      <DayNavigation
        selectedDayKey={selectedDayKey}
        setSelectedDayKey={setSelectedDayKey}
        todayKey={todayKey}
        daySessions={daySessions}
      />

      {daySessions.length === 0 ? (
        <p className="text-muted-foreground mt-4">No sessions logged yet.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {daySessions.map((session) => (
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
