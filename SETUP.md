# Complete Setup Guide

This document provides detailed setup instructions for the Multi-Tenant Workspace Application.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

## Quick Start

### 1. Database Setup

First, create a PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE tenant_db;

# Exit psql
\q
```

### 2. Backend Setup

```bash
cd tenant-backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
BETTER_AUTH_SECRET=$(openssl rand -base64 32)
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_BASE_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/tenant_db
PORT=3000
FRONTEND_URL=http://localhost:3001
NODE_ENV=development
EOF

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Start backend server
npm run start:dev
```

The backend will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd tenant-frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
EOF

# Start frontend server
npm run dev
```

The frontend will run on `http://localhost:3001` (or 3000 if 3001 is taken)

## Key Implementation Details

### Backend Architecture

1. **Better Auth Integration**
   - Better Auth is configured in `src/auth/auth.service.ts`
   - All auth routes are handled at `/api/auth/*`
   - Session management uses HTTP-only cookies

2. **Database**
   - Prisma ORM with PostgreSQL
   - Shared Prisma client instance in `src/lib/prisma.ts`
   - Better Auth tables + custom Outline model

3. **Session Management**
   - Session helper in `src/lib/session.helper.ts`
   - Extracts user and organization from Better Auth session
   - Falls back to headers if session unavailable

4. **API Endpoints**
   - Outlines: `/api/outlines` (GET, POST, PUT, DELETE)
   - Team: `/api/team/members`, `/api/team/invite`, `/api/team/revoke`
   - All endpoints require authentication and organization context

### Frontend Architecture

1. **Better Auth Client**
   - Configured in `lib/auth-client.ts`
   - Uses organization plugin
   - Connects directly to backend auth endpoints

2. **API Helper**
   - `lib/api.ts` handles all API calls
   - Automatically includes credentials for cookie-based auth
   - Handles error responses

3. **Organization Context**
   - `lib/org-context.tsx` manages current organization state
   - Persists to localStorage
   - Used throughout the app

## Authentication Flow

1. **Sign Up** → User creates account with email/password/name
2. **Sign In** → User logs in, session cookie is set
3. **Create Organization** → User creates organization, becomes owner
4. **Join Organization** → User accepts invitation, becomes member
5. **Active Organization** → User's current organization is tracked in session/context

## Organization Roles

- **Owner**: Can invite/remove members, full access
- **Member**: Can access organization data, cannot manage team

## Testing the Application

1. Sign up a new user
2. Create an organization
3. Create outlines within the organization
4. Invite another user (as owner)
5. Sign in as invited user and accept invitation
6. Verify member can see outlines but cannot invite/remove

## Troubleshooting

### Backend Issues

- **Database connection**: Check DATABASE_URL in .env
- **Prisma errors**: Run `npx prisma generate` again
- **Auth errors**: Verify BETTER_AUTH_SECRET is set

### Frontend Issues

- **CORS errors**: Ensure FRONTEND_URL in backend .env matches frontend URL
- **Auth not working**: Check NEXT_PUBLIC_BACKEND_URL points to backend
- **Cookies not sent**: Ensure credentials: "include" in fetch calls

### Common Fixes

```bash
# Reset database
cd tenant-backend
npx prisma migrate reset

# Regenerate Prisma Client
npx prisma generate

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

### Environment Variables

Set all environment variables in your hosting platform:

**Backend:**
- BETTER_AUTH_SECRET (use strong random secret)
- DATABASE_URL (production database)
- BETTER_AUTH_URL (production backend URL)
- FRONTEND_URL (production frontend URL)

**Frontend:**
- NEXT_PUBLIC_BACKEND_URL (production backend URL)

### Database Migrations

```bash
# Production migration
npx prisma migrate deploy
```

### Build Commands

```bash
# Backend
npm run build
npm run start:prod

# Frontend
npm run build
npm start
```

## Support

For issues or questions, refer to:
- Better Auth docs: https://better-auth.com
- NestJS docs: https://docs.nestjs.com
- Next.js docs: https://nextjs.org/docs


