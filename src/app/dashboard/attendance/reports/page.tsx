"use client";

import { useState } from "react";
import {
  fetchAttendanceRecords,
  fetchAttendanceSummary,
} from "@/lib/api";
import type {
  AttendanceRecordRow,
  AttendanceSummaryResponse,
  AttendanceSummaryRow,
} from "@/lib/api";

function getCurrentYearMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export default function AttendanceReportsPage() {
  const { year: currentYear, month: currentMonth } = getCurrentYearMonth();

  const [recordsYear, setRecordsYear] = useState(currentYear);
  const [recordsMonth, setRecordsMonth] = useState(currentMonth);
  const [records, setRecords] = useState<AttendanceRecordRow[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState("");
  const [recordsSearch, setRecordsSearch] = useState("");

  const [summaryYear, setSummaryYear] = useState(currentYear);
  const [summaryMonth, setSummaryMonth] = useState(currentMonth);
  const [summary, setSummary] = useState<AttendanceSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [summarySearch, setSummarySearch] = useState("");

  async function loadRecords() {
    setRecordsLoading(true);
    setRecordsError("");
    try {
      const list = await fetchAttendanceRecords(recordsYear, recordsMonth);
      setRecords(list);
    } catch (err) {
      setRecords([]);
      setRecordsError(err instanceof Error ? err.message : "Failed to load records");
    } finally {
      setRecordsLoading(false);
    }
  }

  async function loadSummary() {
    setSummaryLoading(true);
    setSummaryError("");
    try {
      const data = await fetchAttendanceSummary(summaryYear, summaryMonth);
      setSummary(data);
    } catch (err) {
      setSummary(null);
      setSummaryError(err instanceof Error ? err.message : "Failed to load summary");
    } finally {
      setSummaryLoading(false);
    }
  }

  const summaryRowsRaw: AttendanceSummaryRow[] = summary?.summary ?? [];
  const recordsSearchLower = recordsSearch.trim().toLowerCase();
  const filteredRecords = (
    recordsSearchLower
      ? records.filter(
          (r) =>
            (r.date ?? "").toLowerCase().includes(recordsSearchLower) ||
            (r.rollNo ?? "").toLowerCase().includes(recordsSearchLower) ||
            (r.name ?? "").toLowerCase().includes(recordsSearchLower) ||
            (r.status ?? "").toLowerCase().includes(recordsSearchLower)
        )
      : records
  );
  const summarySearchLower = summarySearch.trim().toLowerCase();
  const summaryRows = (
    summarySearchLower
      ? summaryRowsRaw.filter(
          (r) =>
            (r.rollNo ?? "").toLowerCase().includes(summarySearchLower) ||
            (r.name ?? "").toLowerCase().includes(summarySearchLower)
        )
      : summaryRowsRaw
  );

  return (
    <>
      <div className="space-y-6 sm:space-y-10 min-w-0">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Attendance reports</h1>
        <p className="text-slate-500 text-sm mt-1">Monthly records and summary</p>
      </div>

      {/* Monthly records */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">Monthly records</h2>
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
            <input
              type="number"
              min={2000}
              max={2100}
              value={recordsYear}
              onChange={(e) => setRecordsYear(Number(e.target.value) || currentYear)}
              className="w-28 px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
            <select
              value={recordsMonth}
              onChange={(e) => setRecordsMonth(Number(e.target.value))}
              className="w-32 px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none bg-white"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={loadRecords}
            disabled={recordsLoading}
            className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 font-semibold"
          >
            {recordsLoading ? "Loading..." : "Load records"}
          </button>
          {recordsError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{recordsError}</p>
          )}
        </div>
        <div className="mb-4">
          <input
            type="search"
            placeholder="Search by date, roll no, name, status..."
            value={recordsSearch}
            onChange={(e) => setRecordsSearch(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
          />
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-[65vh] scrollbar-hide">
          <table className="table-modern w-full min-w-[500px]">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 text-slate-600 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-slate-600 font-medium">Roll No</th>
                <th className="text-left py-3 px-4 text-slate-600 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-slate-600 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 px-4 text-slate-500 text-center">
                    No records. Load for selected year/month.
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 px-4 text-slate-500 text-center">
                    No matches for &quot;{recordsSearch}&quot;
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, i) => (
                  <tr key={`${r.date}-${r.studentId}-${i}`} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-700">{r.date}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{r.rollNo ?? "—"}</td>
                    <td className="py-3 px-4 text-slate-700">{r.name ?? "—"}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          r.status === "present" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Monthly summary */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">Monthly summary</h2>
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
            <input
              type="number"
              min={2000}
              max={2100}
              value={summaryYear}
              onChange={(e) => setSummaryYear(Number(e.target.value) || currentYear)}
              className="w-28 px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
            <select
              value={summaryMonth}
              onChange={(e) => setSummaryMonth(Number(e.target.value))}
              className="w-32 px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none bg-white"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={loadSummary}
            disabled={summaryLoading}
            className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 font-semibold"
          >
            {summaryLoading ? "Loading..." : "Load summary"}
          </button>
          {summary && (
            <p className="text-sm text-slate-500">
              {summary.year}-{String(summary.month).padStart(2, "0")}
            </p>
          )}
        </div>
        {summaryError && (
          <p className="mb-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{summaryError}</p>
        )}
        <div className="mb-4">
          <input
            type="search"
            placeholder="Search by roll no, name..."
            value={summarySearch}
            onChange={(e) => setSummarySearch(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
          />
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-[65vh] scrollbar-hide">
          <table className="table-modern w-full min-w-[500px]">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 text-slate-600 font-medium">Roll No</th>
                <th className="text-left py-3 px-4 text-slate-600 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-slate-600 font-medium">Present</th>
                <th className="text-left py-3 px-4 text-slate-600 font-medium">Absent</th>
                <th className="text-left py-3 px-4 text-slate-600 font-medium">Total days</th>
                <th className="text-left py-3 px-4 text-slate-600 font-medium">Present %</th>
                <th className="text-left py-3 px-4 text-slate-600 font-medium">Absent %</th>
              </tr>
            </thead>
            <tbody>
              {summaryRowsRaw.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 px-4 text-slate-500 text-center">
                    No summary for this month.
                  </td>
                </tr>
              ) : summaryRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 px-4 text-slate-500 text-center">
                    No matches for &quot;{summarySearch}&quot;
                  </td>
                </tr>
              ) : (
                summaryRows.map((r) => (
                  <tr key={r.studentId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-medium text-slate-800">{r.rollNo}</td>
                    <td className="py-3 px-4 text-slate-700">{r.name}</td>
                    <td className="py-3 px-4 text-slate-700">{r.present}</td>
                    <td className="py-3 px-4 text-slate-700">{r.absent}</td>
                    <td className="py-3 px-4 text-slate-700">{r.totalDays}</td>
                    <td className="py-3 px-4 text-slate-700">{r.presentPercentage != null ? `${r.presentPercentage}%` : "—"}</td>
                    <td className="py-3 px-4 text-slate-700">{r.absentPercentage != null ? `${r.absentPercentage}%` : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
    </>
  );
}
