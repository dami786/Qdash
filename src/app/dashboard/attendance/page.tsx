"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  fetchAttendanceByDate,
  createAttendance,
  fetchStudents,
} from "@/lib/api";
import type {
  AttendanceByDateResponse,
  AttendanceStatus,
  Student,
} from "@/lib/api";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AttendancePage() {
  const [singleDate, setSingleDate] = useState(todayISO());
  const [byDateData, setByDateData] = useState<AttendanceByDateResponse | null>(null);
  const [byDateLoading, setByDateLoading] = useState(false);
  const [byDateError, setByDateError] = useState("");

  const [students, setStudents] = useState<Student[]>([]);
  const [markDate, setMarkDate] = useState(todayISO());
  const [markRecords, setMarkRecords] = useState<Record<string, AttendanceStatus>>({});
  const [markSubmitting, setMarkSubmitting] = useState(false);
  const [markError, setMarkError] = useState("");
  const [byDateSearch, setByDateSearch] = useState("");
  const [markSearch, setMarkSearch] = useState("");

  async function loadByDate() {
    setByDateLoading(true);
    setByDateError("");
    try {
      const data = await fetchAttendanceByDate(singleDate);
      setByDateData(data);
    } catch (err) {
      setByDateData(null);
      setByDateError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setByDateLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents()
      .then((list) => setStudents(Array.isArray(list) ? list : []))
      .catch(() => setStudents([]));
  }, []);

  function setMarkStatus(studentId: string, status: AttendanceStatus) {
    setMarkRecords((prev) => ({ ...prev, [studentId]: status }));
  }

  function getStudentId(s: Student): string {
    return s.id || (s as Student & { _id?: string })._id || "";
  }

  async function handleMarkSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMarkError("");
    const list = Object.entries(markRecords)
      .filter(([studentId, status]) => status && studentId && studentId !== "undefined")
      .map(([studentId, status]) => ({ studentId, status }));
    if (list.length === 0) {
      setMarkError("Select at least one student (present or absent).");
      return;
    }
    setMarkSubmitting(true);
    try {
      await createAttendance({ date: markDate, records: list });
      setMarkRecords({});
      loadByDate();
      toast.success("Attendance saved");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      setMarkError(msg);
      toast.error(msg);
    } finally {
      setMarkSubmitting(false);
    }
  }

  const byDateListRaw = byDateData?.records ?? [];
  const byDateSearchLower = byDateSearch.trim().toLowerCase();
  const byDateList = (
    byDateSearchLower
      ? byDateListRaw.filter(
          (r) =>
            (r.rollNo ?? "").toLowerCase().includes(byDateSearchLower) ||
            (r.name ?? "").toLowerCase().includes(byDateSearchLower) ||
            (r.status ?? "").toLowerCase().includes(byDateSearchLower)
        )
      : byDateListRaw
  );

  const markSearchLower = markSearch.trim().toLowerCase();
  const filteredStudents = (
    markSearchLower
      ? students.filter(
          (s) =>
            (s.rollNo ?? "").toLowerCase().includes(markSearchLower) ||
            (s.name ?? "").toLowerCase().includes(markSearchLower)
        )
      : students
  );

  return (
    <>
      <div className="h-full min-h-0 flex flex-col gap-6 overflow-hidden">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Attendance</h1>
        <p className="text-slate-500 text-sm mt-1">By date & mark attendance</p>
      </div>

      {/* 1) Ek date ki attendance */}
      <section className="shrink-0 bg-white rounded-2xl border border-slate-200/80 shadow-card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Attendance by date</h2>
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={singleDate}
              onChange={(e) => setSingleDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <button
            type="button"
            onClick={loadByDate}
            disabled={byDateLoading}
            className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 font-semibold"
          >
            {byDateLoading ? "Loading..." : "Load"}
          </button>
          {byDateError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{byDateError}</p>
          )}
        </div>
        {byDateData && (
          <>
            <div className="mb-4">
              <input
                type="search"
                placeholder="Search by roll no, name, status..."
                value={byDateSearch}
                onChange={(e) => setByDateSearch(e.target.value)}
                className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
              />
            </div>
            <div className="overflow-auto max-h-[65vh] scrollbar-hide">
            <table className="w-full min-w-[400px]">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Roll No</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {byDateListRaw.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 px-4 text-slate-500 text-center">
                      No records for this date.
                    </td>
                  </tr>
                ) : byDateList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 px-4 text-slate-500 text-center">
                      No matches for &quot;{byDateSearch}&quot;
                    </td>
                  </tr>
                ) : (
                  byDateList.map((r) => (
                    <tr key={r.studentId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="py-3 px-4 text-slate-700">{byDateData.date ?? singleDate}</td>
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
          </>
        )}
      </section>

      {/* Mark attendance – only this table scrolls (x/y), page stays fixed */}
      <section className="flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 shrink-0">Mark attendance</h2>
        <form onSubmit={handleMarkSubmit} className="flex-1 min-h-0 flex flex-col">
          <div className="shrink-0 flex flex-wrap items-end gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={markDate}
                onChange={(e) => setMarkDate(e.target.value)}
                required
                className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={markSubmitting || students.length === 0}
              className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 font-semibold"
            >
              {markSubmitting ? "Saving..." : "Save attendance"}
            </button>
          </div>
          {markError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl shrink-0">{markError}</p>
          )}
          {students.length === 0 ? (
            <p className="text-slate-500 text-sm shrink-0">No students. Add students first.</p>
          ) : (
            <>
              <div className="shrink-0 mb-4">
                <input
                  type="search"
                  placeholder="Search students by roll no, name..."
                  value={markSearch}
                  onChange={(e) => setMarkSearch(e.target.value)}
                  className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                />
              </div>
              <div className="flex-1 min-h-0 overflow-auto scrollbar-hide">
                <table className="w-full min-w-[400px]">
                  <thead className="bg-slate-50/80 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-slate-600 font-medium">Roll No</th>
                      <th className="text-left py-3 px-4 text-slate-600 font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-slate-600 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 px-4 text-center text-slate-500">
                          No matches for &quot;{markSearch}&quot;
                        </td>
                      </tr>
                    ) : (
                    filteredStudents.map((s) => {
                    const sid = getStudentId(s);
                    return (
                    <tr key={sid} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 px-4 font-medium text-slate-800">{s.rollNo}</td>
                      <td className="py-3 px-4 text-slate-700">{s.name}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-4" role="radiogroup" aria-label={`Status for ${s.rollNo}`}>
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                            <input
                              type="radio"
                              name={`status-${sid}`}
                              value="present"
                              checked={(markRecords[sid] ?? "") === "present"}
                              onChange={() => setMarkStatus(sid, "present")}
                              className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-primary-500"
                            />
                            Present
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                            <input
                              type="radio"
                              name={`status-${sid}`}
                              value="absent"
                              checked={(markRecords[sid] ?? "") === "absent"}
                              onChange={() => setMarkStatus(sid, "absent")}
                              className="w-4 h-4 text-red-600 border-slate-300 focus:ring-primary-500"
                            />
                            Absent
                          </label>
                        </div>
                      </td>
                    </tr>
                  );
                    }) )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </form>
      </section>
    </div>
    </>
  );
}
