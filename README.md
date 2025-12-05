 
# 🚀 Multi-Tenant Workspace Platform

A **production-ready full-stack application** for team collaboration built with a **multi-tenant architecture**.

## Project Status

[![Status](https://img.shields.io/badge/status-active-success)](https://github.com/hailemichael121/Interview-Project)
[![Frontend Deployment](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://tenanncy.onrender.com)
[![Backend Deployment](https://img.shields.io/badge/Backend-Render-blue?logo=render)](https://tenant-backend-cz23.onrender.com)
[![GitHub Repository](https://img.shields.io/badge/Repository-GitHub-000?logo=github)](https://github.com/hailemichael121/Interview-Project)

---

## 📋 Tech Stack

| Component | Stack | Details |
| :--- | :--- | :--- |
| **Frontend** (`/tenant-frontend`) | **Next.js 14**, TypeScript, Tailwind CSS | ![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white) |
| **Backend** (`/tenant-backend`) | **NestJS 10**, TypeScript, Better-Auth | ![NestJS](https://img.shields.io/badge/NestJS-11-red?logo=nestjs&logoColor=white) |
| **Database** | **PostgreSQL**, Prisma ORM | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-7-1B222D?logo=prisma&logoColor=white) |
| **Auth** | **Better-Auth** | Custom organization plugin for multi-tenant cookie-based sessions. |

---

## 🎯 Core Features

### 🔐 Authentication & Security
* **Email/Password Auth**: Secure sign up/sign in using **session cookies**.
* **Multi-tenant Sessions**: Session token includes **organization context**.
* **Role-Based Access Control (RBAC)**: Roles (`Owner`/`Member`) enforced at the API level.
* **CORS Protection**: Strict origin validation using `FRONTEND_URL`.

### 🏢 Organization & Team Management
* **Workspace Creation**: Users can create unlimited organizations.
* **Team Invites**: Invite members via email with role assignment.
* **Organization Switching**: Seamlessly switch context via the `/switch` endpoint.
* **Member Management**: Owners can revoke access and manage roles.

### 📝 Collaboration Tools
* **Outline Management**: Create, edit, and track documents (`Outlines`).
* **Progress Tracking**: `Status` enum for outlines (`DRAFT`, `COMPLETED`, etc.).
* **Data Isolation**: Guaranteed data isolation per organization.

---

## 🏗️ Architecture & Data Flow

The application uses a **standard decoupled architecture** with a focus on multi-tenancy. 

[Image of a diagram showing the multi-tenant architecture with Frontend -> Backend -> PostgreSQL Database]


### Data Isolation Strategy
* **Application-Level Security**: All organization-specific endpoints require the **`X-Organization-Id`** header, which the backend guards use to scope database queries via **Prisma**.
* **Session Context**: The session middleware extracts the active organization ID and current user ID, making them available to controllers and services.
* **Database Schema**: Core models (`Organization`, `Outline`, `Membership`) are linked via explicit foreign keys to enforce relationships.

---

## 🚀 Getting Started (Quick Start)

### 1. Clone the Project
```bash
git clone [https://github.com/hailemichael121/Interview-Project.git](https://github.com/hailemichael121/Interview-Project.git)
cd Interview-Project
````

### 2\. Backend Setup (`tenant-backend`)

The backend runs on **http://localhost:3000**.

```bash
cd tenant-backend
npm install

# ➡️ Configure environment
cp .env.example .env
# Update DATABASE_URL, BETTER_AUTH_SECRET, FRONTEND_URL=http://localhost:3001, and PORT=3000 in the .env file.

# ➡️ Database setup
npx prisma generate
npx prisma migrate dev --name init # Apply migrations
npx prisma db seed # Optional: Seed the database

# ➡️ Start server
npm run start:dev
```

### 3\. Frontend Setup (`tenant-frontend`)

The frontend runs on **http://localhost:3001**.

```bash
cd ../tenant-frontend
npm install

# ➡️ Configure environment
cp .env.local.example .env.local
# Ensure NEXT_PUBLIC_BACKEND_URL=http://localhost:3000 in .env.local

# ➡️ Start application
npm run dev
```

-----

## 📁 Detailed Project Structure

The project is divided into two main applications, using a **monorepo-like structure**:

```
Interview-Project/
├── README.md               # ⬅️ THIS FILE
├── SETUP.md                # Quick setup guide
│
├── tenant-backend/         # ⚙️ NestJS Backend API (Port 3000)
│   ├── src/
│   │   ├── auth/           # Better-Auth integration, Guards, Decorators (e.g., @CurrentUser, OrganizationGuard)
│   │   ├── lib/            # Prisma service and utility wrappers
│   │   ├── organization/   # Organization CRUD, switching, and member management
│   │   ├── outlines/       # Document (Outline) CRUD operations
│   │   └── users/          # User management and profiles
│   ├── prisma/
│   │   ├── schema.prisma   # Main database schema
│   │   └── seed.ts         # Seeding script
│   └── test.rest           # VS Code REST Client file for API testing
│
└── tenant-frontend/        # 🖥️ Next.js 14 Frontend (Port 3001)
    ├── app/
    │   ├── api/            # Next.js API route for proxying requests (auth/[...all]/route.ts)
    │   ├── auth/           # Sign In / Sign Up pages
    │   ├── dashboard/      # Main application entry point
    │   ├── organization/   # Create/Join Organization pages
    │   ├── outlines/       # Outline listing and creation
    │   └── team/           # Team management pages
    ├── components/         # Reusable UI components (shadcn/ui, Layouts, ProtectedRoute)
    ├── hooks/              # Custom hooks (e.g., useSession, useApi)
    └── lib/                # API client (`api-service.ts`), Auth client, Organization Context
```

-----

## 🌐 API Endpoints Reference

All endpoints are hosted at the **Backend URL** (`http://localhost:3000`).

### 🔑 Authentication (`/api/auth/*`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/sign-up/email` | User registration |
| `POST` | `/api/auth/sign-in/email` | User login and session creation |
| `GET` | `/api/auth/session` | Get current session data |
| `POST` | `/api/auth/sign-out` | Destroy session cookie |

### 🏢 Organization & Team (`/api/organization/*`)

| Method | Endpoint | Description | Requires Org ID |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/organization/create` | Create a new organization | No |
| `GET` | `/api/organization` | List all user's organizations | No |
| `POST` | `/api/organization/:id/switch` | Set active organization for session | No |
| `POST` | `/api/organization/:id/invite` | Invite a member via email (Owner only) | Yes |
| `GET` | `/api/organization/:id/members` | List members of the current organization | Yes |

### 📝 Outlines (`/api/outlines/*`)

| Method | Endpoint | Description | Requires Org ID |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/outlines` | List outlines for the active organization | Yes |
| `POST` | `/api/outlines` | Create a new outline | Yes |
| `PUT` | `/api/outlines/:id` | Update an existing outline | Yes |
| `DELETE` | `/api/outlines/:id` | Delete an outline | Yes |

-----

## 🗄️ Database Schema (Prisma)

The core data model uses explicit relationships to enforce multi-tenancy.

```prisma
model User { ... }
model Organization { ... }

model Membership {
  // Links a User to an Organization and defines their Role
  userId         String
  organizationId String
  role           Role @default(MEMBER)
  // ... other fields
  @@unique([userId, organizationId])
}

model Outline {
  // Ensures every outline belongs to exactly one Organization
  organizationId String
  // ... other fields
}

enum Role { OWNER, MEMBER }
enum Status { DRAFT, IN_PROGRESS, ... }
```

-----

## ⚙️ Development Commands

### Backend (`/tenant-backend`)

| Command | Description |
| :--- | :--- |
| `npm run start:dev` | **Start development** (Watch mode) |
| `npx prisma studio` | Open **Prisma Studio** (Database GUI) |
| `npx prisma migrate dev` | Create and apply a new **migration** |
| `npm run test` | Run **unit and integration tests** |
| `npm run build` | Compile to production JavaScript |

### Frontend (`/tenant-frontend`)

| Command | Description |
| :--- | :--- |
| `npm run dev` | **Start development** (Next.js) |
| `npm run build` | **Production build** |
| `npm run lint` | Run **ESLint** for code quality |
| `npm run type-check` | Run **TypeScript type checking** |

-----

## 🐛 Troubleshooting

### Common Issues

1.  **Session/Cookie Errors**:
      * Ensure **cookies are enabled** in your browser.
      * Verify the **`FRONTEND_URL`** in your backend `.env` matches the frontend's origin (`http://localhost:3001`).
      * The frontend uses an **API proxy** at `/api/auth/*` to handle cookie forwarding; check the proxy route (`/tenant-frontend/app/api/auth/[...all]/route.ts`) if direct backend calls fail.
2.  **CORS Issues**:
      * Ensure the `CORS_ORIGIN` variable in the backend `.env` is correctly set (e.g., `http://localhost:3001`).
3.  **Database Errors**:
      * Confirm your **`DATABASE_URL`** is correct and PostgreSQL is running.
      * Run `npx prisma migrate dev` to ensure the schema is up-to-date.

### Debug Mode

```bash
# Backend Debug
npm run start:debug

# Frontend Debug (with Node inspect)
NODE_OPTIONS='--inspect' npm run dev
```

-----

## 🤝 Contributing

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/my-new-feature`).
3.  Commit your changes following the **Conventional Commits** style (e.g., `feat: Add outline assignment`).
4.  Open a Pull Request.

-----

**License**: This project is for interview assessment and demonstration purposes.