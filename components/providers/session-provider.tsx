"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import * as React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
