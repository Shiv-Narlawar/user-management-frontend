# User Management Frontend

React + TypeScript frontend for the User Management System. The app uses Auth0 for authentication, calls the backend API with bearer tokens, and renders different navigation and screens based on the signed-in user's role.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Auth0 React SDK

## Features

- Auth0 login and logout flow
- Session bootstrap through `AuthProvider`
- Role-aware navigation for `ADMIN`, `MANAGER`, and `USER`
- Protected routes with redirect handling
- User management screens
- Department, permission, and audit screens for admin users
- Manager-specific department view
- Shared API layer built on `apiFetch`

## App Structure

```text
src/
  components/      Reusable UI and app shell
  context/         Auth and toast providers
  hooks/           Shared hooks and query hooks
  lib/             API helpers, env access, token helpers, storage
  pages/           Route-level screens
  routes/          Route guards
  services/        Backend API calls
  types/           Shared frontend types
```

## Main Routes

- `/` public landing page or role-based redirect for signed-in users
- `/app/dashboard` shared dashboard
- `/app/users` shared user directory/management page
- `/app/settings` shared settings page
- `/app/my-department` manager-only page
- `/app/roles` admin-only page
- `/app/permissions` admin-only page
- `/app/departments` admin-only page
- `/app/audit` admin-only page

Route protection is handled in [src/App.tsx](./src/App.tsx) and [src/routes/guards.tsx](./src/routes/guards.tsx).

## Authentication Flow

1. The app is wrapped with `Auth0Provider` in [src/main.tsx](./src/main.tsx).
2. `AuthProvider` stores an Auth0 access token getter for API requests.
3. On load, the frontend calls `/auth/me` to fetch the current user from the backend.
4. The backend response drives route access and sidebar navigation.
5. Logout clears local user state and returns the browser to the site origin.

## Environment Variables

Create a `.env` file in `user-management-frontend/` and set:

```env
VITE_API_BASE_URL=http://localhost:7000/api
VITE_AUTH0_DOMAIN=your-auth0-domain
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_AUDIENCE=https://user-management-api
```

Notes:

- `VITE_API_BASE_URL` defaults to `http://localhost:7000/api` if omitted.
- The Auth0 audience should match the API audience configured in your Auth0 tenant.

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Running backend API
- Auth0 application and API configuration

### Install

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

By default Vite serves the app on `http://localhost:5173`.

## Scripts

- `npm run dev` start the Vite dev server
- `npm run build` type-check and build for production
- `npm run lint` run ESLint
- `npm run preview` preview the production build locally

## Backend Integration

Frontend service modules under `src/services/` call the backend API for:

- current user and authentication-related actions
- dashboard stats
- users and managers
- departments
- roles and permissions
- audit logs

All requests go through the shared API utilities in [src/lib/api.ts](./src/lib/api.ts) and [src/lib/apiFetch.ts](./src/lib/apiFetch.ts).

## Important Files

- [src/main.tsx](./src/main.tsx) app bootstrap, providers, Auth0 setup
- [src/App.tsx](./src/App.tsx) route definitions
- [src/context/AuthContext.tsx](./src/context/AuthContext.tsx) session loading and current-user state
- [src/components/AppShell.tsx](./src/components/AppShell.tsx) responsive role-aware shell and navigation
- [src/services/auth.service.ts](./src/services/auth.service.ts) current-user fetch and password reset helper

## Build Notes

- The frontend expects authenticated API access through Auth0 bearer tokens.
- The UI changes by role, but backend permission checks remain the source of truth.
- There are currently no frontend test scripts configured in `package.json`.
