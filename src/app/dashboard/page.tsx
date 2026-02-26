"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchItems,
  fetchTrials,
  fetchDonations,
  fetchStudents,
} from "@/lib/api";

const cardConfig = [
  {
    label: "Free Trials",
    href: "/dashboard/trials",
    icon: UserPlusIcon,
    gradient: "from-emerald-500 to-emerald-700",
    bgLight: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-700",
  },
  {
    label: "Donations",
    href: "/dashboard/donations",
    icon: HeartIcon,
    gradient: "from-amber-500 to-amber-600",
    bgLight: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-700",
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
function ChartBarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
    if (!token) return;
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
  const maxChart = Math.max(
    counts.students,
    counts.trials,
    counts.donations,
    1
  );
  const chartData = [
    { name: "Students", value: counts.students, color: "bg-primary-500", label: "Students" },
    { name: "Trials", value: counts.trials, color: "bg-emerald-500", label: "Trials" },
    { name: "Donations", value: counts.donations, color: "bg-amber-500", label: "Donations" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            Overview
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Quick stats and activity at a glance
          </p>
        </div>
      </div>

      {/* Total Students – prominent card */}
      <section className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-card min-w-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-primary-600/10 pointer-events-none" />
        <div className="relative p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-100 border border-primary-200 flex items-center justify-center shrink-0">
                <StudentsIcon className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">
                  Total Students
                </p>
                {loading ? (
                  <div className="h-9 w-20 bg-slate-200 rounded-lg animate-pulse mt-1" />
                ) : (
                  <p className="text-3xl md:text-4xl font-bold text-slate-800 tabular-nums mt-0.5">
                    {counts.students}
                  </p>
                )}
                <p className="text-slate-400 text-xs mt-1">
                  Updates as you add students
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/students"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors shrink-0"
            >
              View students
              <span className="text-primary-200">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats cards grid */}
      <div className="min-w-0">
        <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">Quick stats</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 bg-white rounded-2xl border border-slate-200/80 shadow-card animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cardConfig.map((card, i) => {
              const value = counts[countKeys[i]];
              const Icon = card.icon;
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group block bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-slate-300/80 transition-all duration-200 overflow-hidden"
                >
                  <div className={`h-1 w-full bg-gradient-to-r ${card.gradient}`} />
                  <div className="p-5">
                    <div
                      className={`w-11 h-11 rounded-xl ${card.bgLight} ${card.borderColor} border flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200`}
                    >
                      <Icon className={`w-6 h-6 ${card.textColor}`} />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">{card.label}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-0.5 tabular-nums">
                      {value}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 font-medium group-hover:text-primary-600 transition-colors">
                      View all →
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Graph – bar chart */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden min-w-0">
        <div className="p-4 sm:p-5 md:p-6 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-slate-500 shrink-0" />
            <h2 className="text-base sm:text-lg font-semibold text-slate-800">Overview chart</h2>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Students, trials & donations comparison
          </p>
        </div>
        <div className="p-4 sm:p-5 md:p-6">
          {loading ? (
            <div className="h-56 flex items-end gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-1 bg-slate-200 rounded-t animate-pulse min-h-[80px]"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="h-52 flex items-end gap-6 sm:gap-8">
                {chartData.map((item) => (
                  <div
                    key={item.name}
                    className="flex-1 flex flex-col items-center gap-2 min-w-0"
                  >
                    <div
                      className={`w-full max-w-[80px] rounded-t ${item.color} transition-all duration-500 ease-out`}
                      style={{
                        height: `${(item.value / maxChart) * 180}px`,
                        minHeight: item.value > 0 ? "12px" : "0",
                      }}
                      title={`${item.label}: ${item.value}`}
                    />
                    <span className="text-xs font-medium text-slate-600 truncate w-full text-center">
                      {item.label}
                    </span>
                    <span className="text-sm font-semibold text-slate-800 tabular-nums">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
