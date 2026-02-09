import { useState, createContext } from "react";

const toLocalInputValue = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const AddSessionDialogContext = createContext<{
  open: boolean;
  game: string;
  start: string;
  end: string;
  intent: string;
  outcome: string;
  error: string | null;

  setOpen: (open: boolean) => void;
  setError: (error: string | null) => void;
  setIntent: (intent: string) => void;
  setGame: (game: string) => void;
  setStart: (start: string) => void;
  setEnd: (end: string) => void;
  setOutcome: (outcome: string) => void;

  openAddSessionDialog: () => void;
}>({
  open: false,
  game: "",
  start: "",
  end: "",
  intent: "",
  outcome: "",
  error: null,

  setOpen: () => {},
  setGame: () => {},
  setError: () => {},
  setIntent: () => {},
  setStart: () => {},
  setEnd: () => {},
  setOutcome: () => {},

  openAddSessionDialog: () => {},
});

export const AddSessionDialogProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [game, setGame] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [intent, setIntent] = useState("");
  const [outcome, setOutcome] = useState("");
  const [error, setError] = useState<string | null>(null);

  const openAddSessionDialog = () => {
    const end = new Date();
    const start = new Date(end.getTime() - 60 * 60 * 1000);
    setGame("");
    setStart(toLocalInputValue(start));
    setEnd(toLocalInputValue(end));
    setIntent("");
    setOutcome("");
    setError(null);
    setOpen(true);
  };

  return (
    <AddSessionDialogContext.Provider
      value={{
        open,
        game,
        start,
        end,
        intent,
        outcome,
        error,

        setOpen,
        setError,
        setIntent,
        setGame,
        setStart,
        setEnd,
        setOutcome,

        openAddSessionDialog,
      }}
    >
      {children}
    </AddSessionDialogContext.Provider>
  );
};
