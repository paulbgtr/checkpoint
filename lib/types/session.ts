export type Session = {
  id: string;
  game: string;
  start: number;
  end: number;
  intent?: string;
  outcome?: string;
};

export type ActiveSession = Omit<Session, "end" | "outcome">;
