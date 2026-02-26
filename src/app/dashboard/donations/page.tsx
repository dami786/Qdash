"use client";

import { useEffect, useState } from "react";
import { fetchDonations, type Donation } from "@/lib/api";

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

function resolveReceiptUrl(raw?: string | null): string | null {
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

  // Build absolute URL from API base, stripping trailing /api if present
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://quranacd-production-ddd5.up.railway.app/api";
  const baseOrigin = apiBase.replace(/\/api\/?$/, "");
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${baseOrigin}${path}`;
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [previewReceipt, setPreviewReceipt] = useState<string | null>(null);

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
            <table className="w-full min-w-[600px]">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Phone</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Donate Type</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Receipt</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Date</th>
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
                  filteredDonations.map((d) => (
                    <tr key={d.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {d.name || d.donor_name || "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{d.phone || "—"}</td>
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {d.amount != null ? `Rs ${d.amount.toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={d.donateType ?? d.donate_type}>
                        {d.donateType ?? d.donate_type ?? "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {(() => {
                          const receiptUrl = resolveReceiptUrl(
                            d.receipt ?? d.receipt_url ?? d.receiptUrl ?? null
                          );
                          return receiptUrl ? (
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
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {formatDate(
                          d.created_at ?? d.createdAt ?? d.date ?? d.submitted_at ?? d.submittedAt
                        )}
                      </td>
                    </tr>
                  ))
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
    </div>
  );
}
