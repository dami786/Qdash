"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken, fetchNotifications, type Notification } from "@/lib/api";

const navCategories = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutIcon },
      { href: "/dashboard/students", label: "Students", icon: BookIcon },
      { href: "/dashboard/trials", label: "Free Trials", icon: UserPlusIcon },
      { href: "/dashboard/notifications", label: "Notifications", icon: BellIcon },
    ],
  },
  {
    label: "Attendance",
    items: [
      { href: "/dashboard/attendance", label: "Attendance", icon: LayoutIcon },
      { href: "/dashboard/attendance/reports", label: "Attendance reports", icon: LayoutIcon },
    ],
  },
  {
    label: "Enquiries",
    items: [
      { href: "/dashboard/queries", label: "Queries", icon: ChatIcon },
      { href: "/dashboard/registrations", label: "Registrations", icon: UserPlusIcon },
      { href: "/dashboard/donations", label: "Donations", icon: HeartIcon },
    ],
  },
];

function LayoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM16 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM16 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}
function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}
function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  );
}
function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}
function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 10h.01M12 10h.01M16 10h.01M21 12a9 9 0 11-3.219-6.855L21 4.5 20.1 8.1A8.97 8.97 0 0121 12z"
      />
    </svg>
  );
}
function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0h6z"
      />
    </svg>
  );
}
function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hr ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay} days ago`;
    return date.toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Load notifications for top-right bell dropdown
    fetchNotifications()
      .then((list) => {
        if (Array.isArray(list)) {
          setNotifications(list);
          const unread = list.filter(
            (n) => n.read === false || n.is_read === false || (!n.read && !n.is_read)
          ).length;
          setUnreadCount(unread);
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
      })
      .catch(() => {
        setNotifications([]);
        setUnreadCount(0);
      });
  }, []);

  function handleLogout() {
    clearToken();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-100/80">
      {/* Mobile overlay – close sidebar on tap */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar – drawer on mobile, fixed on lg+ */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-30 w-64 max-w-[85vw] bg-primary-800 text-white flex flex-col shadow-sidebar transition-transform duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 sm:p-6 border-b border-primary-700/60 shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-lg font-bold shadow-card shrink-0">
              ب
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight truncate">Babul Islam</h1>
              <p className="text-primary-200 text-xs font-medium">Dashboard</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            className="lg:hidden p-2 rounded-lg text-primary-200 hover:bg-primary-700/70 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-2 overflow-y-auto overflow-x-hidden scrollbar-thin min-h-0 flex flex-col gap-4">
          {navCategories.map((cat) => (
            <div key={cat.label}>
              <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-primary-300/90">
                {cat.label}
              </p>
              <div className="space-y-0.5">
                {cat.items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                        active
                          ? "bg-primary-600 text-white shadow-card"
                          : "text-primary-100 hover:bg-primary-700/70 hover:text-white"
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0 opacity-90" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-primary-700/60 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:text-red-700 transition-all duration-200"
          >
            <LogoutIcon className="w-5 h-5 shrink-0" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content – full width on mobile, margin when sidebar visible on lg+ */}
      <main className="lg:ml-64 min-h-screen flex flex-col min-w-0 overflow-hidden">
        <header className="shrink-0 z-10 glass border-b border-slate-200/80">
          <div className="h-14 sm:h-16 px-4 sm:px-6 md:px-8 flex items-center gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Open menu"
                className="lg:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:bg-slate-200/80 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <MenuIcon className="w-6 h-6" />
              </button>
              <p className="text-slate-500 text-sm font-medium">
                Welcome back
              </p>
            </div>

            <div className="ml-auto flex items-center gap-2 relative">
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => setNotificationsOpen((open) => !open)}
                className="relative inline-flex items-center justify-center rounded-full p-2.5 text-slate-600 hover:bg-slate-200/80 transition-colors"
              >
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 inline-flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white px-1">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 max-h-96 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden z-20">
                  <div className="px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      Notifications
                    </span>
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/notifications")}
                      className="text-[11px] font-medium text-primary-600 hover:text-primary-700"
                    >
                      View all
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-3 py-4 text-center text-xs text-slate-500">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 7).map((n) => {
                        const isRead = n.read === true || n.is_read === true;
                        const created = n.createdAt || n.created_at || "";
                        return (
                          <div
                            key={n.id}
                            className={`px-3 py-2.5 text-xs border-b border-slate-100 last:border-0 ${
                              isRead ? "bg-white" : "bg-indigo-50/70"
                            }`}
                          >
                            <div className="font-semibold text-slate-800 truncate">
                              {n.title || "Notification"}
                            </div>
                            <div className="text-slate-600 text-[11px] line-clamp-2">
                              {n.message || "—"}
                            </div>
                            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                              <span>{created ? formatRelativeTime(created) : "—"}</span>
                              {!isRead && <span className="text-emerald-600 font-semibold">New</span>}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="p-4 sm:p-6 md:p-8 min-h-[70vh] overflow-y-auto overflow-x-hidden box-border">{children}</div>
        </div>
      </main>
    </div>
  );
}

