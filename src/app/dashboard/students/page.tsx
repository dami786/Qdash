"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchStudents, createStudent, deleteStudent, type Student } from "@/lib/api";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ rollNo: "", name: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetchStudents()
      .then((data) => setStudents(Array.isArray(data) ? data : []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.rollNo || !form.name) {
      setError("Roll No and name are required.");
      return;
    }
    setSubmitting(true);
    try {
      await createStudent({ rollNo: form.rollNo, name: form.name });
      setForm({ rollNo: "", name: "" });
      load();
      toast.success("Student added");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add student";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(s: Student) {
    if (!s.id) return;
    if (!confirm(`Delete student "${s.name}" (${s.rollNo})? This cannot be undone.`)) return;
    setDeletingId(s.id);
    try {
      await deleteStudent(s.id);
      load();
      toast.success("Student deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(value?: string) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  }

  const searchLower = search.trim().toLowerCase();
  const filteredStudents = (
    searchLower
      ? students.filter(
          (s) =>
            (s.rollNo ?? "").toLowerCase().includes(searchLower) ||
            (s.name ?? "").toLowerCase().includes(searchLower) ||
            (s.id ?? "").toLowerCase().includes(searchLower)
        )
      : students
  );

  return (
    <div className="min-w-0">
      <div className="mb-6 sm:mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Students</h1>
          <p className="text-slate-500 text-sm mt-1">Manage student list (roll no + name)</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-4 sm:p-6 mb-6 sm:mb-8 max-w-xl">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Add student</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Roll No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.rollNo}
                onChange={(e) => setForm((f) => ({ ...f, rollNo: e.target.value }))}
                placeholder="ST-001"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ahmad Ali"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 font-semibold"
            >
              {submitting ? "Saving..." : "Add student"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden min-w-0">
        {loading ? (
          <div className="p-6 sm:p-10 text-center text-slate-500">Loading...</div>
        ) : students.length === 0 ? (
          <div className="p-6 sm:p-10 text-center text-slate-500">No students yet.</div>
        ) : (
          <>
            <div className="p-3 sm:p-4 border-b border-slate-200/80">
              <input
                type="search"
                placeholder="Search by roll no, name, student ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
              />
            </div>
            <div className="overflow-x-auto overflow-y-auto max-h-[65vh] scrollbar-hide -mx-px">
              <table className="table-modern w-full min-w-[400px]">
                <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-slate-600 font-medium">Roll No</th>
                    <th className="text-left py-3 px-4 text-slate-600 font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-slate-600 font-medium">Student ID</th>
                    <th className="text-left py-3 px-4 text-slate-600 font-medium">Created</th>
                    <th className="text-left py-3 px-4 text-slate-600 font-medium w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 px-4 text-center text-slate-500">
                        No matches for &quot;{search}&quot;
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                      >
                        <td className="py-3 px-4 font-medium text-slate-800">{s.rollNo}</td>
                        <td className="py-3 px-4 text-slate-700">{s.name}</td>
                        <td className="py-3 px-4 text-slate-600 text-xs break-all">{s.id}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {formatDate(s.createdAt || s.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleDelete(s)}
                            disabled={deletingId === s.id}
                            className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                          >
                            {deletingId === s.id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

