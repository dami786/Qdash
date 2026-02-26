"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchItems,
  fetchTrials,
  fetchDonations,
  fetchStudents,
} from "@/lib/api";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getDateLabel() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const cardConfig = [
  {
    label: "Free Trials",
    href: "/dashboard/trials",
    icon: UserPlusIcon,
    gradient: "from-emerald-500 to-teal-600",
    bgGradient: "from-emerald-500/20 to-teal-500/10",
    ring: "ring-emerald-500/20",
    textColor: "text-emerald-600",
  },
  {
    label: "Donations",
    href: "/dashboard/donations",
    icon: HeartIcon,
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-500/20 to-orange-500/10",
    ring: "ring-amber-500/20",
    textColor: "text-amber-600",
  },
];

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  );
}
function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}
function StudentsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  );
}

export default function DashboardOverview() {
  const [counts, setCounts] = useState({
    students: 0,
    courses: 0,
    trials: 0,
    donations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("babul_islam_token") : null;
    if (!token) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetchStudents().then((d) => (Array.isArray(d) ? d.length : 0)),
      fetchItems().then((d) => (Array.isArray(d) ? d.length : 0)),
      fetchTrials().then((d) => (Array.isArray(d) ? d.length : 0)),
      fetchDonations().then((d) => (Array.isArray(d) ? d.length : 0)),
    ])
      .then(([students, courses, trials, donations]) =>
        setCounts({ students, courses, trials, donations })
      )
      .catch(() => setCounts({ students: 0, courses: 0, trials: 0, donations: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const countKeys = ["courses", "trials", "donations"] as const;
  const total = counts.students + counts.trials + counts.donations;
  const chartData = [
    { name: "Students", value: counts.students, color: "from-teal-500 to-cyan-500", fill: "#0d9488" },
    { name: "Trials", value: counts.trials, color: "from-emerald-500 to-teal-500", fill: "#10b981" },
    { name: "Donations", value: counts.donations, color: "from-amber-500 to-orange-500", fill: "#f59e0b" },
  ];

  const donutSegments = chartData.map((item) => ({
    ...item,
    pct: total > 0 ? (item.value / total) * 100 : 0,
  }));
  let donutOffset = 0;
  const gradientStops =
    total > 0
      ? donutSegments
          .map((seg) => {
            if (seg.pct <= 0) return null;
            const start = donutOffset;
            const end = donutOffset + seg.pct;
            donutOffset = end;
            return `${seg.fill} ${start}% ${end}%`;
          })
          .filter(Boolean)
          .join(", ")
      : "#e2e8f0 0% 100%";

  return (
    <div className="min-w-0 space-y-8 sm:space-y-10">
      {/* Hero / Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-800 to-teal-900/90 px-6 py-8 sm:px-8 sm:py-10 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(20,184,166,0.15),transparent)] pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
        <div className="relative">
          <p className="text-teal-300/90 text-sm font-medium uppercase tracking-widest">
            {getDateLabel()}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {getGreeting()}
          </h1>
          <p className="mt-1 text-slate-400 text-sm">
            Here’s what’s happening across your dashboard today.
          </p>
        </div>
      </div>

      {/* Total Students – hero stat */}
      <section className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60 min-w-0">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/[0.06] via-transparent to-cyan-500/[0.06] pointer-events-none" />
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-teal-400/10 blur-2xl transition-all group-hover:bg-teal-400/20" />
        <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-50 to-cyan-50 shadow-inner">
              <StudentsIcon className="h-9 w-9 text-teal-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Students
              </p>
              {loading ? (
                <div className="mt-1 h-10 w-24 animate-pulse rounded-lg bg-slate-200" />
              ) : (
                <p className="mt-0.5 text-4xl font-bold tabular-nums text-slate-900 sm:text-5xl">
                  {counts.students}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-400">
                Live count — updates as you add students
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/students"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-teal-600/25 transition-all hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/30"
          >
            View students
            <span className="text-teal-200">→</span>
          </Link>
        </div>
      </section>

      {/* Quick stats */}
      <div className="min-w-0">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Quick stats</h2>
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl border border-slate-200/80 bg-slate-100/80"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cardConfig.map((card, i) => {
              const value = counts[countKeys[i]];
              const Icon = card.icon;
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-200/40 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300/80 hover:shadow-lg hover:shadow-slate-300/50"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                  <div className="relative flex items-start justify-between">
                    <div className={`rounded-xl border bg-white/80 p-3 shadow-sm ring-2 ${card.ring} transition-transform duration-300 group-hover:scale-105`}>
                      <Icon className={`h-7 w-7 ${card.textColor}`} />
                    </div>
                    <span className="text-xs font-medium text-slate-400 transition-colors group-hover:text-slate-600">
                      View all →
                    </span>
                  </div>
                  <p className="relative mt-4 text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="relative mt-0.5 text-3xl font-bold tabular-nums text-slate-800">
                    {value}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Chart – donut overview (like analytics dashboards) */}
      <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
        <div className="border-b border-slate-200/80 bg-slate-50/50 px-6 py-5 sm:px-8">
          <h2 className="text-lg font-semibold text-slate-800">Overview split</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Students, trials & donations — share of total
          </p>
        </div>
        <div className="p-6 sm:p-8">
          {loading ? (
            <div className="flex h-64 items-center justify-center gap-8">
              <div className="h-40 w-40 sm:h-48 sm:w-48 animate-pulse rounded-full bg-slate-200/70" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8 md:flex-row">
              <div className="relative h-40 w-40 sm:h-48 sm:w-48">
                <div
                  className="h-full w-full rounded-full bg-slate-100"
                  style={{
                    backgroundImage: `conic-gradient(${gradientStops})`,
                  }}
                />
                <div className="absolute inset-7 sm:inset-8 flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Total
                  </p>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900">
                    {total}
                  </p>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                {chartData.map((item) => {
                  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                  return (
                    <div key={item.name} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="text-sm font-medium text-slate-700">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold tabular-nums text-slate-800">
                          {item.value}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
                {total === 0 && (
                  <p className="text-sm text-slate-500">
                    No data yet. Once you add students, trials or donations, this chart will
                    update automatically.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
