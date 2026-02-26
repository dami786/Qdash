# Babul Islam Dashboard

Next.js + Tailwind CSS admin dashboard. APIs integrated: Courses (items), Free Trials, Donations, Queries, Users (SuperAdmin).

## Setup

1. **Install**
   ```bash
   npm install
   ```

2. **Environment**
   - Copy `.env.local.example` to `.env.local`
   - Set `NEXT_PUBLIC_API_URL` (default: `https://quranacd-production-ddd5.up.railway.app/api`)

3. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/login`. After login, token is stored in `localStorage` and used for all API calls.

## Auth

- **Login:** Email + password. Token is saved in `localStorage` under `babul_islam_token`.
- Backend login endpoint assumed: `POST /auth/login` with body `{ "email", "password" }`, response `{ "token" }`. If your API uses a different path (e.g. `/login`), update `src/lib/api.ts` → `login()`.

## Dashboard sections

| Section     | APIs used |
|------------|-----------|
| **Courses** | GET/POST/PUT/DELETE `/items` |
| **Free Trials** | GET `/trials`, PATCH/DELETE `/trials/:id` |
| **Donations** | GET `/donations` |
| **Queries** | GET `/queries`, PATCH `/queries/:id` (status, reply) |
| **Users** (SuperAdmin) | GET `/auth/users`, PATCH `/auth/users/:id/role` |

All requests send header: `Authorization: Bearer <token>`.
