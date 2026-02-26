"use client";

import { useEffect, useState } from "react";
import { Toaster as HotToaster } from "react-hot-toast";

export default function Toaster() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#1e293b",
          color: "#f1f5f9",
          borderRadius: "12px",
          padding: "14px 18px",
          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.3)",
        },
        success: {
          iconTheme: { primary: "#22c55e", secondary: "#f1f5f9" },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: "#f1f5f9" },
          style: {
            background: "#450a0a",
            color: "#fecaca",
          },
        },
      }}
    />
  );
}
