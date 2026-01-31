import Dexie, { type Table } from "dexie";

import type { Session } from "@/lib/types/session";

export class CheckpointDB extends Dexie {
  sessions!: Table<Session, string>;

  constructor() {
    super("checkpoint");
    this.version(1).stores({
      sessions: "id, start, end, game",
    });
  }
}

export const db = new CheckpointDB();
