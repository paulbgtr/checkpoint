"use client";

import { AddSessionDialogProvider } from "@/lib/context/add-session-dialog-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <AddSessionDialogProvider>{children}</AddSessionDialogProvider>;
}
