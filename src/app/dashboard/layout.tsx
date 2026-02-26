"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = getToken();
    setHasToken(!!token);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (hasToken === false) {
      router.replace("/login");
    }
  }, [ready, hasToken, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100/80">
        <div className="text-slate-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (hasToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100/80">
        <div className="text-slate-500 text-sm">Redirecting to login...</div>
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
