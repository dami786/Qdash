"use client";

import { useEffect, useState } from "react";
import { fetchDonations, deleteDonation, type Donation } from "@/lib/api";

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

// For donations we trust backend's receiptUrl as-is
function getReceiptUrl(d: Donation): string | null {
  const raw = (d as any).receiptUrl ?? d.receipt_url ?? d.receipt ?? null;
  if (!raw || typeof raw !== "string") return null;
  return raw;
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [previewReceipt, setPreviewReceipt] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDonations()
      .then((data) => setDonations(Array.isArray(data) ? data : []))
      .catch(() => setDonations([]))
      .finally(() => setLoading(false));
  }, []);

  const searchLower = search.trim().toLowerCase();
  const filteredDonations = (
    searchLower
      ? donations.filter(
          (d) =>
            (d.name ?? "").toLowerCase().includes(searchLower) ||
            (d.donor_name ?? "").toLowerCase().includes(searchLower) ||
            (d.phone ?? "").toLowerCase().includes(searchLower) ||
            (d.amount != null && String(d.amount).includes(searchLower)) ||
            (d.donateType ?? "").toLowerCase().includes(searchLower) ||
            (d.donate_type ?? "").toLowerCase().includes(searchLower)
        )
      : donations
  );

  function openDeletePopup(id: string | undefined) {
    if (!id) return;
    setDeleteConfirmId(id);
  }

  async function confirmDelete() {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await deleteDonation(deleteConfirmId);
      setDonations((prev) => prev.filter((d) => d.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("Failed to delete donation", err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-w-0">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Donations</h1>
        <p className="text-slate-500 text-sm mt-1">View all donations</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-10 text-center text-slate-500">
          Loading...
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-10 text-center text-slate-500">
          No donations yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden min-w-0">
          <div className="p-3 sm:p-4 border-b border-slate-200/80">
            <input
              type="search"
              placeholder="Search by name, phone, amount, donate type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            />
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[65vh] scrollbar-hide">
            <table className="table-modern w-full min-w-[650px]">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Phone</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Donate Type</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Receipt</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Date</th>
                  <th className="text-center py-3 px-4 text-slate-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 px-4 text-center text-slate-500">
                      No matches for &quot;{search}&quot;
                    </td>
                  </tr>
                ) : (
                  filteredDonations.map((d) => {
                    const amountNumber =
                      typeof d.amount === "string"
                        ? Number(d.amount.replace(/,/g, "")) || undefined
                        : d.amount;
                    const dateValue =
                      d.created_at ?? d.createdAt ?? d.date ?? d.submitted_at ?? d.submittedAt;
                    const receiptUrl = getReceiptUrl(d);
                    return (
                      <tr
                        key={d.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                      >
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {d.name || d.donor_name || "—"}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{d.phone || "—"}</td>
                        <td className="py-3 px-4 text-slate-800 font-medium">
                          {amountNumber != null ? `Rs ${amountNumber.toLocaleString()}` : "—"}
                        </td>
                        <td
                          className="py-3 px-4 text-slate-600 max-w-xs truncate"
                          title={d.donateType ?? d.donate_type}
                        >
                          {d.donateType ?? d.donate_type ?? "—"}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {receiptUrl ? (
                            <button
                              type="button"
                              onClick={() => setPreviewReceipt(receiptUrl)}
                              className="block focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded overflow-hidden"
                            >
                              <img
                                src={receiptUrl}
                                alt="Receipt"
                                className="h-12 w-12 object-cover rounded border border-slate-200 hover:opacity-90 cursor-pointer"
                              />
                            </button>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {formatDate(dateValue)}
                        </td>
                        <td className="py-3 px-4 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => openDeletePopup(d.id)}
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
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receipt image preview modal */}
      {previewReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewReceipt(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Receipt preview"
        >
          <button
            type="button"
            onClick={() => setPreviewReceipt(null)}
            className="absolute top-4 right-4 text-white hover:text-slate-300 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
          <img
            src={previewReceipt}
            alt="Receipt full size"
            className="max-h-[90vh] max-w-full object-contain rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-card border border-slate-200/80 w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Delete donation?</h3>
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
