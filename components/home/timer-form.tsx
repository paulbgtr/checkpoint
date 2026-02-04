"use client";

import { useState } from "react";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
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
import type { ActiveSession } from "@/lib/types/session";

type Props = {
  gameName: string;
  setGameName: (name: string) => void;
  intent: string;
  setIntent: (intent: string) => void;
  activeSession: ActiveSession | null;
  startDisabled?: boolean;
  handleStart: () => void;
  handleStop: () => void;
};

export const TimerForm = ({
  gameName,
  setGameName,
  intent,
  setIntent,
  activeSession,
  startDisabled = false,
  handleStart,
  handleStop,
}: Props) => {
  const [open, setOpen] = useState(false);
  const canStart = gameName.trim().length > 0;

  const handleStartSession = () => {
    if (!canStart || startDisabled) {
      return;
    }
    handleStart();
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      {activeSession ? (
        <Button variant="destructive" onClick={handleStop}>
          Stop timer
        </Button>
      ) : (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <Button onClick={() => setOpen(true)} disabled={startDisabled}>
            Start timer
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Start a session</AlertDialogTitle>
              <AlertDialogDescription>
                Set a quick intent before you start the timer.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="game-title">Game title</Label>
                <Input
                  id="game-title"
                  type="text"
                  placeholder="Enter game title"
                  value={gameName}
                  onChange={(event) => setGameName(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="intent-note">Intent (optional, 10-30s)</Label>
                <Textarea
                  id="intent-note"
                  placeholder="What do you want to get out of this session?"
                  value={intent}
                  onChange={(event) => setIntent(event.target.value)}
                  maxLength={240}
                  rows={3}
                />
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleStartSession}
                disabled={!canStart || startDisabled}
              >
                Start timer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};
