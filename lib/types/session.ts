export type Session = {
  id: string;
  game: string;
  start: number;
  end: number;
};

export type ActiveSession = Omit<Session, "end">;
