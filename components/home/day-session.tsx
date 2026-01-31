"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardHeader, CardFooter, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { formatDuration } from "@/lib/utils/format-duration";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

type Props = {
  sessions: {
    id: string;
    game: string;
    start: number;
    end: number;
  }[];
};

const getDayKey = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const formatDayLabel = (date: Date) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

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

  const selectedDate = useMemo(
    () => new Date(selectedDayKey),
    [selectedDayKey],
  );
  const isTodaySelected = selectedDayKey === todayKey;

  const daySessions = useMemo(() => {
    return sessions.filter(
      (session) => getDayKey(new Date(session.start)) === selectedDayKey,
    );
  }, [sessions, selectedDayKey]);

  const shiftDay = (delta: number) => {
    setSelectedDayKey((current) => {
      const next = new Date(current);
      next.setDate(next.getDate() + delta);
      return getDayKey(next);
    });
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl">
            {isTodaySelected ? "Today’s sessions" : "Sessions"} (
            {daySessions.length})
          </h2>
          <p className="text-muted-foreground">{formatDayLabel(selectedDate)}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => shiftDay(-1)}
            aria-label="Previous day"
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => shiftDay(1)}
            aria-label="Next day"
            disabled={isTodaySelected}
          >
            <ChevronRightIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDayKey(todayKey)}
            disabled={isTodaySelected}
          >
            Today
          </Button>
        </div>
      </div>

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
