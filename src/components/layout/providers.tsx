"use client";
import React from "react";
import ThemeProvider from "./ThemeToggle/theme-provider";
// import { SessionProvider, SessionProviderProps } from "next-auth/react";
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import {
  TooltipProvider,
} from "@/components/ui/tooltip";


const queryClient = new QueryClient();

export default function Providers({
  session,
  children,
}: {
  session: any; // SessionProviderProps["session"];
  children: React.ReactNode;
}) {
  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          {/* <SessionProvider session={session}> */}
            <TooltipProvider delayDuration={100}>
              {children}
            </TooltipProvider>
          {/* </SessionProvider> */}
        </QueryClientProvider>
      </ThemeProvider>
    </>
  );
}
