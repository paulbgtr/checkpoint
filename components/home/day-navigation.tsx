import { useMemo, type Dispatch, type SetStateAction } from "react";

import { Button } from "../ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { getDayKey } from "@/lib/utils/get-day-key";
import type { Session } from "@/lib/types/session";

type Props = {
  selectedDayKey: number;
  setSelectedDayKey: Dispatch<SetStateAction<number>>;
  todayKey: number;
  daySessions: Session[];
};

const formatDayLabel = (date: Date) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

export const DayNavigation = ({
  selectedDayKey,
  setSelectedDayKey,
  todayKey,
  daySessions,
}: Props) => {
  const selectedDate = useMemo(
    () => new Date(selectedDayKey),
    [selectedDayKey],
  );
  const isTodaySelected = selectedDayKey === todayKey;

  const shiftDay = (delta: number) => {
    setSelectedDayKey((current) => {
      const next = new Date(current);
      next.setDate(next.getDate() + delta);
      return getDayKey(next);
    });
  };

  return (
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
  );
};
