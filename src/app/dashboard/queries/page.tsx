"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  fetchQueries,
  createQuery,
  updateQuery,
  deleteQuery,
  type Query,
  type QueryStatus,
} from "@/lib/api";

const statusLabels: Record<QueryStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
};

const DEFAULT_ACCEPT_REPLY =
  "Jazakallah, your request has been approved. We will contact you shortly.";

const DEFAULT_REJECT_REPLY =
  "We are unable to proceed with this request at the moment.";

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
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    package: "",
    course: "",
  });
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchQueries()
      .then((data) => setQueries(Array.isArray(data) ? data : []))
      .catch(() => setQueries([]))
      .finally(() => setLoading(false));
  }, []);

  const searchLower = search.trim().toLowerCase();
  const filteredQueries =
    searchLower.length > 0
      ? queries.filter((q) => {
          const name = (q.name ?? "").toLowerCase();
          const email = (q.email ?? "").toLowerCase();
          const phone = (q.phone ?? "").toLowerCase();
          const pkg = String(q.package ?? "").toLowerCase();
          const course = (q.course ?? "").toLowerCase();
          const message = (q.message ?? "").toLowerCase();
          const status = (q.status ?? "").toLowerCase();
          return (
            name.includes(searchLower) ||
            email.includes(searchLower) ||
            phone.includes(searchLower) ||
            pkg.includes(searchLower) ||
            course.includes(searchLower) ||
            message.includes(searchLower) ||
            status.includes(searchLower)
          );
        })
      : queries;

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await createQuery({
        name: createForm.name || undefined,
        email: createForm.email || undefined,
        phone: createForm.phone || undefined,
        message: createForm.message || undefined,
        package: createForm.package || undefined,
        course: createForm.course || undefined,
      });
      setCreateForm({
        name: "",
        email: "",
        phone: "",
        message: "",
        package: "",
        course: "",
      });
      setQueries((prev) => [created, ...prev]);
    } catch (err) {
      console.error("Failed to create query", err);
    } finally {
      setCreating(false);
    }
  }

  async function handleStatusChange(id: string, status: QueryStatus) {
    if (!id) return;
    setUpdatingId(id);
    try {
      const reply =
        status === "accepted"
          ? DEFAULT_ACCEPT_REPLY
          : status === "rejected"
          ? DEFAULT_REJECT_REPLY
          : undefined;
      const updated = await updateQuery(id, { status, reply });
      setQueries((prev) => prev.map((q) => (q.id === id ? { ...q, ...updated } : q)));
    } catch (err) {
      console.error("Failed to update query", err);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleReplyChange(id: string) {
    const current = queries.find((q) => q.id === id);
    if (!current) return;
    const nextReply = window.prompt("Edit reply:", current.reply ?? "");
    if (nextReply == null) return;

    setUpdatingId(id);
    try {
      const updated = await updateQuery(id, { reply: nextReply });
      setQueries((prev) => prev.map((q) => (q.id === id ? { ...q, ...updated } : q)));
    } catch (err) {
      console.error("Failed to update reply", err);
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
      await deleteQuery(deleteConfirmId);
      setQueries((prev) => prev.filter((q) => q.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("Failed to delete query", err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-w-0">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Queries</h1>
        <p className="text-slate-500 text-sm mt-1">
          View and manage contact, package and course queries
        </p>
      </div>

      <div className="mb-6 bg-white rounded-2xl border border-slate-200/80 shadow-card p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Add query manually</h2>
        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 items-end"
        >
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
            <input
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
            <input
              type="text"
              value={createForm.phone}
              onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Package</label>
            <input
              type="text"
              value={createForm.package}
              onChange={(e) => setCreateForm((f) => ({ ...f, package: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Course</label>
            <input
              type="text"
              value={createForm.course}
              onChange={(e) => setCreateForm((f) => ({ ...f, course: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Message</label>
            <input
              type="text"
              value={createForm.message}
              onChange={(e) => setCreateForm((f) => ({ ...f, message: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="I want to know more about your packages."
            />
          </div>
          <div className="md:col-span-1">
            <button
              type="submit"
              disabled={creating}
              className="w-full inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
            >
              {creating ? "Saving..." : "Add query"}
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-10 text-center text-slate-500">
          Loading...
        </div>
      )}

      {!loading && queries.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-10 text-center text-slate-500">
          No queries yet.
        </div>
      )}

      {!loading && queries.length > 0 && (
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
            <table className="table-modern w-full min-w-[800px]">
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
                  <th className="text-right py-3 px-4 text-slate-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueries.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-6 px-4 text-center text-slate-500">
                      No matches for "{search}"
                    </td>
                  </tr>
                )}

                {filteredQueries.length > 0 &&
                  filteredQueries.map((q) => {
                    const isPending = q.status === "pending";
                    return (
                      <tr
                        key={q.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                      >
                        <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                          {q.name || "—"}
                        </td>
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
                        <td className="py-3 px-4 text-slate-600">
                          {formatDate(q.createdAt || q.created_at || (q as any).date)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap align-middle">
                          <div className="flex items-center justify-center gap-2">
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(q.id, "accepted")}
                                  disabled={!!updatingId}
                                  className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                                >
                                  {updatingId === q.id ? "Saving..." : "Accept"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(q.id, "rejected")}
                                  disabled={!!updatingId}
                                  className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                  {updatingId === q.id ? "Saving..." : "Reject"}
                                </button>
                              </>
                            )}
                            {!isPending && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(q.id, "pending")}
                                disabled={!!updatingId}
                                className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-600 text-white hover:bg-slate-700 disabled:opacity-50"
                              >
                                {updatingId === q.id ? "Saving..." : "Reset"}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => openDeletePopup(q.id)}
                              title="Delete"
                              className="inline-flex items-center justify-center p-1.5 rounded-lg text-red-600 hover:bg-red-50"
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
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Delete query?</h3>
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

