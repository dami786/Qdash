"use client";

import { useEffect, useState } from "react";
import { fetchTrials, deleteTrial, updateTrialStatus, type Trial, type TrialStatus } from "@/lib/api";

const statusLabels: Record<TrialStatus, string> = {
  pending: "Pending",
  free_trial: "Free trial",
  pro: "Pro",
  approved: "Approved",
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

export default function TrialsPage() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTrials()
      .then((data) => setTrials(Array.isArray(data) ? data : []))
      .catch(() => setTrials([]))
      .finally(() => setLoading(false));
  }, []);

  const searchLower = search.trim().toLowerCase();
  const filteredTrials = trials
    .filter((t) => (t.source ?? "").toLowerCase() === "free_trial")
    .filter((t) =>
      !searchLower
        ? true
        : (t.name ?? "").toLowerCase().includes(searchLower) ||
          (t.email ?? "").toLowerCase().includes(searchLower) ||
          (t.phone ?? "").toLowerCase().includes(searchLower) ||
          (t.course ?? "").toLowerCase().includes(searchLower) ||
          (t.message ?? "").toLowerCase().includes(searchLower) ||
          (t.status ?? "").toLowerCase().includes(searchLower) ||
          (t.source ?? "").toLowerCase().includes(searchLower)
    );

  async function handleStatusChange(id: string, status: TrialStatus) {
    if (!id) return;
    setUpdatingId(id);
    try {
      const updated = await updateTrialStatus(id, status);
      setTrials((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    } catch (err) {
      console.error("Failed to update trial", err);
    } finally {
      setUpdatingId(null);
    }
  }

  function openDeletePopup(id: string) {
    setDeleteConfirmId(id);
  }

  async function confirmDelete() {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await deleteTrial(deleteConfirmId);
      setTrials((prev) => prev.filter((t) => t.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("Failed to delete trial", err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-w-0">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
          Free trials
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Free trial requests
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-10 text-center text-slate-500">
          Loading...
        </div>
      ) : filteredTrials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-10 text-center text-slate-500">
          No free trial requests yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden min-w-0">
          <div className="p-3 sm:p-4 border-b border-slate-200/80">
            <input
              type="search"
              placeholder="Search by name, email, phone, course, message, status, source..."
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
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Course</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Message</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Source</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Created</th>
                  <th className="text-center py-3 px-4 text-slate-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrials.map((t) => {
                  const created = t.createdAt || t.created_at || "";
                  const createdFormatted = created ? formatDate(created) : "—";
                  const isPending = t.status === "pending";
                  return (
                    <tr
                      key={t.id || t._id || ""}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                    >
                      <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {t.name || "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{t.email || "—"}</td>
                      <td className="py-3 px-4 text-slate-600">{t.phone || "—"}</td>
                      <td className="py-3 px-4 text-slate-600">{t.course || "—"}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{t.message || "—"}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            t.status === "pro"
                              ? "bg-emerald-100 text-emerald-800"
                              : t.status === "free_trial"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {statusLabels[t.status]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{t.source || "—"}</td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {createdFormatted}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap align-middle">
                        <div className="flex items-center justify-center gap-2">
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(t.id, "approved")}
                                disabled={!!updatingId}
                                className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                              >
                                {updatingId === t.id ? "Saving..." : "Approve"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(t.id, "rejected")}
                                disabled={!!updatingId}
                                className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                              >
                                {updatingId === t.id ? "Saving..." : "Reject"}
                              </button>
                            </>
                          )}
                          {!isPending && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(t.id, "pending")}
                              disabled={!!updatingId}
                              className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-600 text-white hover:bg-slate-700 disabled:opacity-50"
                            >
                              {updatingId === t.id ? "Saving..." : "Reset"}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openDeletePopup(t.id)}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-card border border-slate-200/80 w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Delete trial?</h3>
            <p className="text-slate-600 text-sm mb-6">Are you sure? This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleting}
                className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

