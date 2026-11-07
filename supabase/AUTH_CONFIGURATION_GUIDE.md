# FamilySphere Supabase Authentication & Profile Management Configuration Guide

This guide details the complete configuration required to connect the **Ambulkar Family Tree website (FamilySphere)** to Supabase Auth and Database for the 3-tier Role-Based Access Control (RBAC), Member Registration, Profile Management, and Profile Update Approval System.

---

## 1. Project Credentials

Configured centrally in `.env` and `src/lib/supabase.ts`:

- **Supabase Project URL:** `https://vhufjomnmyazzbayfocf.supabase.co`
- **Supabase Publishable Key:** `VITE_SUPABASE_PUBLISHABLE_KEY` (configured in `.env`)
- **Central Client:** `src/lib/supabase.ts`

---

## 2. Supabase Auth Settings in Dashboard

In the Supabase Dashboard (`https://supabase.com/dashboard/project/vhufjomnmyazzbayfocf`):

### 2.1 Enable Email / Password Provider
1. Navigate to **Authentication** -> **Providers** -> **Email**.
2. Ensure **Enable Email provider** is turned **ON**.
3. Set **Confirm email** according to preference (can be enabled for production; disabled in development/demo testing for instant access).
4. Secure password minimum length: **6 characters**.

### 2.2 Redirect URLs
In **Authentication** -> **URL Configuration**:
- **Site URL:** Your live deployment URL (or `http://localhost:3000`)
- **Redirect URLs:**
  - `http://localhost:3000/**`
  - `http://localhost:3000/login.html`
  - `http://localhost:3000/register.html`
  - `http://localhost:3000/member-dashboard.html`
  - `http://localhost:3000/profile.html`

---

## 3. 3-Tier Access Levels (RBAC Architecture)

| Level | Role | Permissions |
|---|---|---|
| **Level 1** | `member` | Register and log in. View the complete family tree. Edit safe personal profile fields (bio, education, occupation, achievements, contact, personal photos). Submit profile/relationship update requests. View update history. Cannot edit other members' profiles. |
| **Level 2** | `family_admin` | All member permissions plus: review, approve, or reject profile update requests submitted by members in their family branch (e.g., Dr. Swapnil for Sudhakar Branch). Manage branch photos and member accounts. |
| **Level 3** | `super_admin` | Complete control. Full Super Admin Control Panel access (18 modules). Approve all change requests across all branches. Manage all profiles, relationships, branches, and website settings. View immutable audit logs. |

---

## 4. Database Tables & Row Level Security (RLS)

Run `supabase/migrations/20261104000000_init_familysphere_schema.sql` in the **Supabase SQL Editor**.

Key tables for authentication and profile management:
- `public.user_profiles` – Stores user metadata, email, assigned branch, and role (`super_admin`, `family_admin`, `member`).
- `public.family_members` – Official directory records linked via `owner_user_id = auth.uid()`.
- `public.profile_update_requests` – Pending approval queue for sensitive fields (Name, Birth, Branch, Relationships).
- `public.activity_logs` – Security audit trail.

---

## 5. Storage Buckets for Member Profile Photos

Under **Storage** -> **Buckets**:
- `profile-photos` (Public: Enabled)
- `family-photos` (Public: Enabled)

RLS Policies for Storage:
```sql
-- Allow authenticated family members to upload profile pictures
CREATE POLICY "Authenticated users can upload profile photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-photos');

-- Public read access for profile pictures
CREATE POLICY "Public profile photo read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');
```

---

## 6. Seed Accounts for Testing

| Account Name | Email | Password | Role | Notes |
|---|---|---|---|---|
| Sarthak Ambulkar | `sarthakambulkar09@gmail.com` | `password123` | **Super Admin** | Full vault access, approves all updates |
| Dr. Swapnil Ambulkar | `swapnil@ambulkar.family` | `password123` | **Family Admin** | Doctor / Sudhakar Branch Admin |
| Sagar Ambulkar | `sagar@ambulkar.family` | `password123` | **Member** | Twin Brother / Sudhakar Branch |
| Maratherao Ambulkar | `maratherao@ambulkar.family` | `password123` | **Member** | Founding Patriarch |
| Komal Ambulkar | `komal@ambulkar.family` | `password123` | **Member** | Granddaughter |
