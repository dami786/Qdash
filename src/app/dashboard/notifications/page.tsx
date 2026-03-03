"use client";

import { useEffect, useState } from "react";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
} from "@/lib/api";

function formatDate(s?: string) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications()
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifications.filter((n) => n.read !== true && n.is_read !== true && n.isRead !== true).length;

  async function handleMarkRead(id: string) {
    if (!id) return;
    setUpdatingId(id);
    try {
      const updated = await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                ...updated,
                read: true,
                is_read: true,
              }
            : n
        )
      );
    } catch (err) {
      console.error("Failed to mark notification read", err);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleMarkAllRead() {
    if (!notifications.length) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read: true,
          is_read: true,
        }))
      );
    } catch (err) {
      console.error("Failed to mark all notifications read", err);
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div className="min-w-0">
      <div className="mb-6 sm:mb-8 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Notifications
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            System notifications and important updates
          </p>
        </div>
        <button
          type="button"
          onClick={handleMarkAllRead}
          disabled={markingAll || unreadCount === 0}
          className="inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {markingAll ? "Marking..." : unreadCount > 0 ? "Mark all read" : "All read"}
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-10 text-center text-slate-500">
          Loading...
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-10 text-center text-slate-500">
          No notifications yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden min-w-0">
          <div className="overflow-x-auto overflow-y-auto max-h-[65vh] scrollbar-hide">
            <table className="table-modern w-full min-w-[700px]">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Title</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Message</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Created</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((n) => {
                  const created = n.createdAt || n.created_at || (n as any).date || "";
                  const createdFormatted = created ? formatDate(created) : "—";
                  const isRead = n.read === true || n.is_read === true || n.isRead === true;
                  return (
                    <tr
                      key={n.id}
                      className={`border-b border-slate-100 last:border-0 ${
                        isRead ? "bg-white" : "bg-indigo-50/40"
                      }`}
                    >
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {n.title || "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-pre-line">
                        {n.message || "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{n.type || "—"}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            isRead
                              ? "bg-slate-100 text-slate-700"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {isRead ? "Read" : "Unread"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {createdFormatted}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isRead && (
                          <button
                            type="button"
                            onClick={() => handleMarkRead(n.id)}
                            disabled={updatingId === n.id}
                            className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {updatingId === n.id ? "Saving..." : "Mark read"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

