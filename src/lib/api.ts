/**
 * Babul Islam Dashboard – API client
 * Base URL: NEXT_PUBLIC_API_URL
 * Auth: Bearer token from localStorage
 */

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL || "https://quranacd-production-ddd5.up.railway.app/api";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("babul_islam_token");
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("babul_islam_token", token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("babul_islam_token");
}

type RequestOptions = Omit<RequestInit, "body"> & { body?: object | FormData };

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, ...rest } = options;
  const url = `${getBaseUrl()}${path}`;
  const headers: HeadersInit = {
    ...(rest.headers as Record<string, string>),
  };
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(url, {
    ...rest,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || res.statusText || "Request failed");
  }
  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return res.text() as Promise<T>;
}

// ——— Auth ———
// 1) Login – token lene ke liye (add course ke liye zaroori)
// curl -X POST ".../api/auth/login" -H "Content-Type: application/json" -d '{"email":"...","password":"..."}'
export async function login(email: string, password: string): Promise<{ token: string; user?: { role?: string } }> {
  const data = await request<{ token: string; user?: { role?: string } }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  return data;
}

// ——— Items (Courses) ———
// Same-to-same as curl:
//   curl -X POST ".../api/items" -H "Authorization: Bearer YOUR_TOKEN" \
//     -F "title=Noorani Qaida" \
//     -F "description=Foundation course for beginners. Step-by-step lessons." \
//     -F "image=@/path/to/course-image.jpg"
// GET /items – saari courses (auth optional). POST /items – token zaroori.
export interface Item {
  id: string;
  title: string;
  description?: string;
  price?: number;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

export async function fetchItems(): Promise<Item[]> {
  return request<Item[]>("/items");
}

// POST /items – FormData: title, description, price (optional), image (optional)
export async function createItem(data: { title: string; description?: string; price?: number }, image?: File): Promise<Item> {
  const form = new FormData();
  form.append("title", data.title);
  if (data.description != null && data.description !== "") form.append("description", data.description);
  if (data.price != null) form.append("price", String(data.price));
  if (image) form.append("image", image);
  return request<Item>("/items", { method: "POST", body: form });
}

// 5) Default courses seed (jab koi course na ho) – token zaroori
// curl -X POST ".../api/items/seed" -H "Authorization: Bearer TOKEN"
export async function seedItems(): Promise<Item[]> {
  return request<Item[]>("/items/seed", { method: "POST" });
}

export async function updateItem(id: string, data: { title?: string; description?: string; price?: number }): Promise<Item> {
  return request<Item>(`/items/${id}`, { method: "PUT", body: data });
}

export async function deleteItem(id: string): Promise<void> {
  await request(`/items/${id}`, { method: "DELETE" });
}

// ——— Trials (Free Trials / Register Now) ———
// GET /trials – sari entries (Bearer token)
// DELETE /trials/:id – kisi ek ko delete
export type TrialStatus = "pending" | "free_trial" | "pro" | "approved" | "rejected";

export interface Trial {
  id: string;
  _id?: string; // backend (e.g. Mongo) may return _id
  name?: string;
  email?: string;
  phone?: string;
  course?: string;
  message?: string;
  status: TrialStatus;
  source?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

export async function fetchTrials(): Promise<Trial[]> {
  const raw = await request<(Trial & { _id?: string })[]>("/trials");
  const list = Array.isArray(raw) ? raw : [];
  return list.map((t) => ({
    ...t,
    id: t.id || t._id || "",
  }));
}

// Sirf Register Now trials – GET /trials/register-now
export async function fetchRegisterNowTrials(): Promise<Trial[]> {
  const raw = await request<(Trial & { _id?: string })[]>("/trials/register-now");
  const list = Array.isArray(raw) ? raw : [];
  return list.map((t) => ({
    ...t,
    id: t.id || t._id || "",
  }));
}

export async function updateTrialStatus(id: string, status: TrialStatus): Promise<Trial> {
  return request<Trial>(`/trials/${encodeURIComponent(id)}`, { method: "PATCH", body: { status } });
}

export async function deleteTrial(id: string): Promise<void> {
  await request(`/trials/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// ——— Donations ———
// Curl: -F name=... -F phone=... -F amount=... -F donateType=... -F receipt=@image.jpg
// GET /donations response fields (camelCase or snake_case from backend):
export interface Donation {
  id: string;
  _id?: string;
  name?: string;
  donor_name?: string;
  phone?: string;
  amount?: number | string;
  donateType?: string;
  donate_type?: string;
  // Backend might return full URL or relative path, sometimes with different keys
  receipt?: string;
  receipt_url?: string;
  receiptUrl?: string;
  email?: string;
  message?: string;
  created_at?: string;
  createdAt?: string;
  date?: string;
  submitted_at?: string;
  submittedAt?: string;
}

export async function fetchDonations(): Promise<Donation[]> {
  const raw = await request<(Donation & { _id?: string; amount?: number | string })[]>(
    "/donations"
  );
  const list = Array.isArray(raw) ? raw : [];
  return list.map((d) => ({
    ...d,
    id: d.id || d._id || "",
    amount:
      typeof d.amount === "string"
        ? Number(d.amount.replace(/,/g, "")) || undefined
        : d.amount,
  }));
}

export async function deleteDonation(id: string): Promise<void> {
  await request(`/donations/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// ——— Queries (Chat / Contact / Packages) ———
export type QueryStatus = "pending" | "accepted" | "rejected";

// Supports JSON payload from public site:
// {
//   "name": "Test Student",
//   "email": "student@example.com",
//   "phone": "+92 300 1234567",
//   "message": "I am interested in this package.",
//   "package": "Basic",
//   "course": "Quran with Tajweed"
// }
export interface Query {
  id: string;
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  status: QueryStatus;
  reply?: string;
  package?: string | boolean;
  course?: string;
  created_at?: string;
  updated_at?: string;
}

export async function fetchQueries(): Promise<Query[]> {
  const raw = await request<(Query & { _id?: string })[]>("/queries");
  const list = Array.isArray(raw) ? raw : [];
  return list.map((q) => ({
    ...q,
    id: q.id || q._id || "",
  }));
}

export async function updateQuery(id: string, data: { status?: QueryStatus; reply?: string }): Promise<Query> {
  return request<Query>(`/queries/${id}`, { method: "PATCH", body: data });
}

export async function createQuery(data: {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  package?: string;
  course?: string;
}): Promise<Query> {
  return request<Query>("/queries", { method: "POST", body: data });
}

export async function deleteQuery(id: string): Promise<void> {
  await request(`/queries/${id}`, { method: "DELETE" });
}

// ——— Students ———
// Curl:
//   POST /students -d '{"rollNo":"ST-001","name":"Ahmad Ali"}'
//   GET /students   – saare students (dashboard mapping)
export interface Student {
  id: string;
  _id?: string; // backend (e.g. Mongo) may return _id
  rollNo: string;
  name: string;
  created_at?: string;
  createdAt?: string;
}

export async function fetchStudents(): Promise<Student[]> {
  const raw = await request<(Student & { _id?: string })[]>("/students");
  const list = Array.isArray(raw) ? raw : [];
  return list.map((s) => ({
    ...s,
    id: s.id || s._id || "",
  }));
}

export async function createStudent(data: { rollNo: string; name: string }): Promise<Student> {
  return request<Student>("/students", { method: "POST", body: data });
}

/** DELETE /students/:id – requires Bearer token (same as curl -X DELETE -H "Authorization: Bearer TOKEN") */
export async function deleteStudent(studentId: string): Promise<void> {
  await request(`/students/${encodeURIComponent(studentId)}`, { method: "DELETE" });
}

// ——— Attendance ———
// GET  /attendance?date=YYYY-MM-DD – ek date ki attendance
// GET  /attendance/records?year=YYYY&month=M – month ka sara record (table)
// GET  /attendance/summary?year=YYYY&month=M – monthly summary (present/absent %)
// POST /attendance – attendance mark karo
export type AttendanceStatus = "present" | "absent";

export interface AttendanceRecordInput {
  studentId: string;
  status: AttendanceStatus;
}

// Response: GET /attendance?date=...
export interface AttendanceByDateRecord {
  studentId: string;
  status: AttendanceStatus;
  rollNo?: string;
  name?: string;
}
export interface AttendanceByDateResponse {
  date?: string;
  records: AttendanceByDateRecord[];
}

// Response: GET /attendance/records?year=...&month=...
export interface AttendanceRecordRow {
  date: string;
  studentId: string;
  rollNo?: string;
  name?: string;
  status: AttendanceStatus;
}

// Response: GET /attendance/summary?year=...&month=...
export interface AttendanceSummaryRow {
  studentId: string;
  rollNo: string;
  name: string;
  present: number;
  absent: number;
  totalDays: number;
  presentPercentage: number;
  absentPercentage: number;
}
export interface AttendanceSummaryResponse {
  year: number;
  month: number;
  summary: AttendanceSummaryRow[];
}

export async function fetchAttendanceByDate(date: string): Promise<AttendanceByDateResponse> {
  const params = new URLSearchParams({ date });
  const res = await request<AttendanceByDateResponse | AttendanceByDateRecord[]>(
    `/attendance?${params.toString()}`
  );
  if (Array.isArray(res)) return { date, records: res };
  return res;
}

export async function fetchAttendanceRecords(
  year: number,
  month: number
): Promise<AttendanceRecordRow[]> {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });
  const res = await request<AttendanceRecordRow[] | { records?: AttendanceRecordRow[] }>(
    `/attendance/records?${params.toString()}`
  );
  return Array.isArray(res) ? res : res?.records ?? [];
}

export async function createAttendance(data: {
  date: string;
  records: AttendanceRecordInput[];
}): Promise<unknown> {
  return request<unknown>("/attendance", { method: "POST", body: data });
}

export async function fetchAttendanceSummary(
  year: number,
  month: number
): Promise<AttendanceSummaryResponse> {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });
  return request<AttendanceSummaryResponse>(`/attendance/summary?${params.toString()}`);
}

// ——— Users (SuperAdmin) ———
export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email?: string;
  name?: string;
  role: UserRole;
  created_at?: string;
  createdAt?: string;
}

export async function fetchUsers(): Promise<User[]> {
  return request<User[]>("/auth/users");
}

export async function updateUserRole(id: string, role: UserRole): Promise<User> {
  return request<User>(`/auth/users/${id}/role`, { method: "PATCH", body: { role } });
}

// ——— Notifications ———
export interface Notification {
  id: string;
  _id?: string;
  title?: string;
  message?: string;
  type?: string;
  // Various backends might use different fields for read state
  read?: boolean;
  is_read?: boolean;
  isRead?: boolean;
  readAt?: string;
  read_at?: string;
  status?: string;
  created_at?: string;
  createdAt?: string;
}

function normalizeNotification(n: Notification & { _id?: string }): Notification {
  const status = (n.status || "").toLowerCase();
  const isRead =
    n.read === true ||
    n.is_read === true ||
    n.isRead === true ||
    !!n.readAt ||
    !!n.read_at ||
    status === "read";

  return {
    ...n,
    id: n.id || n._id || "",
    read: isRead,
    is_read: isRead,
    isRead,
  };
}

export async function fetchNotifications(onlyUnread = false): Promise<Notification[]> {
  const path = onlyUnread ? "/notifications?onlyUnread=true" : "/notifications";
  const raw = await request<(Notification & { _id?: string })[]>(path);
  const list = Array.isArray(raw) ? raw : [];
  return list.map((n) => normalizeNotification(n));
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const updated = await request<Notification>(`/notifications/${id}/read`, { method: "PATCH" });
  return normalizeNotification(updated as Notification & { _id?: string });
}

export async function markAllNotificationsRead(): Promise<void> {
  await request("/notifications/mark-all-read", { method: "PATCH" });
}

