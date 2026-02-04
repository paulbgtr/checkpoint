"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardHeader, CardFooter, CardTitle, CardContent } from "../ui/card";
import { DayNavigation } from "./day-navigation";
import { formatDuration } from "@/lib/utils/format-duration";
import { getDayKey } from "@/lib/utils/get-day-key";
import type { Session } from "@/lib/types/session";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";

type Props = {
  sessions: Session[];
  onDelete: (sessionId: string) => void;
  onEdit: (session: Session) => void;
};

type SessionCardProps = {
  session: Session;
  onDelete: (sessionId: string) => void;
  onEdit: (session: Session) => void;
};

const SessionCard = ({ session, onDelete, onEdit }: SessionCardProps) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [draftGame, setDraftGame] = useState(session.game);
  const [draftIntent, setDraftIntent] = useState(session.intent ?? "");
  const [draftOutcome, setDraftOutcome] = useState(session.outcome ?? "");

  useEffect(() => {
    if (!editOpen) {
      return;
    }
    setDraftGame(session.game);
    setDraftIntent(session.intent ?? "");
    setDraftOutcome(session.outcome ?? "");
  }, [editOpen, session]);

  const canSave = draftGame.trim().length > 0;

  const handleSave = () => {
    if (!canSave) {
      return;
    }
    onEdit({
      ...session,
      game: draftGame.trim(),
      intent: draftIntent.trim() ? draftIntent.trim() : undefined,
      outcome: draftOutcome.trim() ? draftOutcome.trim() : undefined,
    });
    setEditOpen(false);
  };

  const handleDelete = () => {
    onDelete(session.id);
    setDeleteOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{session.game}</CardTitle>

        <div>
          {new Date(session.start).toLocaleTimeString()} -{" "}
          {new Date(session.end).toLocaleTimeString()}
        </div>
      </CardHeader>

      {session.intent || session.outcome ? (
        <CardContent className="space-y-2">
          {session.intent ? (
            <p className="text-muted-foreground whitespace-pre-line">
              <span className="text-foreground font-medium">Intent:</span>{" "}
              {session.intent}
            </p>
          ) : null}
          {session.outcome ? (
            <p className="text-muted-foreground whitespace-pre-line">
              <span className="text-foreground font-medium">Outcome:</span>{" "}
              {session.outcome}
            </p>
          ) : null}
        </CardContent>
      ) : null}

      <CardFooter className="justify-between gap-2">
        <div>Duration: {formatDuration(session.end - session.start)}</div>
        <div className="flex gap-2">
          <AlertDialog open={editOpen} onOpenChange={setEditOpen}>
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Edit session</AlertDialogTitle>
                <AlertDialogDescription>
                  Update the game name or notes for this session.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`game-title-${session.id}`}>Game title</Label>
                  <Input
                    id={`game-title-${session.id}`}
                    value={draftGame}
                    onChange={(event) => setDraftGame(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`intent-${session.id}`}>Intent</Label>
                  <Textarea
                    id={`intent-${session.id}`}
                    value={draftIntent}
                    onChange={(event) => setDraftIntent(event.target.value)}
                    maxLength={240}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`outcome-${session.id}`}>Outcome</Label>
                  <Textarea
                    id={`outcome-${session.id}`}
                    value={draftOutcome}
                    onChange={(event) => setDraftOutcome(event.target.value)}
                    maxLength={240}
                    rows={3}
                  />
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSave} disabled={!canSave}>
                  Save changes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete session</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
};

export const DaySession = ({ sessions, onDelete, onEdit }: Props) => {
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
            <SessionCard
              key={session.id}
              session={session}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </section>
  );
};
