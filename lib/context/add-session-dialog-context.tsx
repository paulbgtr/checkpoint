import { useState, createContext } from "react";

export const AddSessionDialogContext = createContext<{
  addOpen: boolean;
  setAddOpen: (open: boolean) => void;
  setAddError: (error: string | null) => void;
  addGame: string;
  addStart: string;
  addEnd: string;
  addIntent: string;
  addOutcome: string;
  setAddIntent: (intent: string) => void;
  setAddGame: (game: string) => void;
  setAddStart: (start: string) => void;
  setAddEnd: (end: string) => void;
  setAddOutcome: (outcome: string) => void;
  addError: string | null;
}>({
  addOpen: false,
  setAddOpen: () => {},
  setAddError: () => {},
  addGame: "",
  addStart: "",
  addEnd: "",
  addIntent: "",
  addOutcome: "",
  setAddIntent: () => {},
  setAddGame: () => {},
  setAddStart: () => {},
  setAddEnd: () => {},
  setAddOutcome: () => {},
  addError: null,
});

export const AddSessionDialogProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [addOpen, setAddOpen] = useState(false);
  const [addGame, setAddGame] = useState("");
  const [addStart, setAddStart] = useState("");
  const [addEnd, setAddEnd] = useState("");
  const [addIntent, setAddIntent] = useState("");
  const [addOutcome, setAddOutcome] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  return (
    <AddSessionDialogContext.Provider
      value={{
        addOpen,
        setAddOpen,
        setAddError,
        addGame,
        addStart,
        addEnd,
        addIntent,
        addOutcome,
        setAddIntent,
        setAddGame,
        setAddStart,
        setAddEnd,
        setAddOutcome,
        addError,
      }}
    >
      {children}
    </AddSessionDialogContext.Provider>
  );
};
