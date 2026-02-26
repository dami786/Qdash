"use client";

import { useEffect, useState } from "react";
import { fetchQueries, type Query, type QueryStatus } from "@/lib/api";

const statusLabels: Record<QueryStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
};

function formatDate(s?: string) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return s;
  }
}

export default function QueriesPage() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchQueries()
      .then((data) => setQueries(Array.isArray(data) ? data : []))
      .catch(() => setQueries([]))
      .finally(() => setLoading(false));
  }, []);

  const searchLower = search.trim().toLowerCase();
  const filteredQueries = (
    searchLower
      ? queries.filter(
          (q) =>
            (q.name ?? "").toLowerCase().includes(searchLower) ||
            (q.email ?? "").toLowerCase().includes(searchLower) ||
            (q.phone ?? "").toLowerCase().includes(searchLower) ||
            (String(q.package ?? "")).toLowerCase().includes(searchLower) ||
            (q.course ?? "").toLowerCase().includes(searchLower) ||
            (q.message ?? "").toLowerCase().includes(searchLower) ||
            (q.status ?? "").toLowerCase().includes(searchLower)
        )
      : queries
  );

  return (
    <div className="min-w-0">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Queries</h1>
        <p className="text-slate-500 text-sm mt-1">
          View contact, package and course queries from the website
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-10 text-center text-slate-500">
          Loading...
        </div>
      ) : queries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-10 text-center text-slate-500">
          No queries yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden min-w-0">
          <div className="p-3 sm:p-4 border-b border-slate-200/80">
            <input
              type="search"
              placeholder="Search by name, email, phone, package, course, message, status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            />
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[65vh] scrollbar-hide">
            <table className="table-modern w-full min-w-[700px]">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Phone</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Package</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Course</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Message</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 px-4 text-center text-slate-500">
                      No matches for &quot;{search}&quot;
                    </td>
                  </tr>
                ) : (
                  filteredQueries.map((q) => (
                    <tr key={q.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-medium text-slate-800">{q.name || "—"}</td>
                      <td className="py-3 px-4 text-slate-600">{q.email || "—"}</td>
                      <td className="py-3 px-4 text-slate-600">{q.phone || "—"}</td>
                      <td className="py-3 px-4">
                        {q.package != null && q.package !== "" ? (
                          <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800">
                            {q.package.toString()}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{q.course || "—"}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={q.message}>
                        {q.message || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            q.status === "accepted"
                              ? "bg-emerald-100 text-emerald-800"
                              : q.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {statusLabels[q.status]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(q.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

