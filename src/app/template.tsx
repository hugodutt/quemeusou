'use client';

import { GameProvider } from "@/contexts/GameContext";
import { Toaster } from "react-hot-toast";
import { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <>
      <GameProvider>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
      </GameProvider>
    </>
  );
} 