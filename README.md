# Multi-Tenant Workspace Application
A full-stack multi-tenant workspace application built with Next.js, NestJS, PostgreSQL, and Better-Auth.

## Tech Stack
- **Frontend**: ![Next.js](https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Nextjs-logo.svg/48px-Nextjs-logo.svg.png) Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: ![NestJS](https://nestjs.com/img/logo_text.svg =48x24) NestJS, TypeScript, Better-Auth
- **Database**: ![PostgreSQL](https://www.postgresql.org/media/img/about/press/elephant.png =48x48) PostgreSQL with ![Prisma](https://github.com/prisma/presskit/raw/main/Assets/Prisma-DarkLogo.svg =48x24) Prisma ORM
- **Authentication**: Better-Auth with organizations plugin

## Features
- User authentication (sign up/sign in)
- Organization management (create/join)
- Role-based access control (Owner/Member)
- Team management with invite system
- Outline/document management
- Multi-tenant data isolation

## Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

## Quick Start
### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd Interview-Project
```

### 2. Backend Setup
```bash
cd tenant-backend
# Install dependencies
npm install
# Setup environment variables
# Create .env file with:
# DATABASE_URL=postgresql://user:password@localhost:5432/tenant_db
# BETTER_AUTH_SECRET=your-secret-key-here-change-in-production
# BETTER_AUTH_URL=http://localhost:3000
# FRONTEND_URL=http://localhost:3001
# PORT=3000

# Database setup
npx prisma generate
npx prisma migrate dev --name init
# Start development server
npm run start:dev
```
Backend runs on http://localhost:3000

### 3. Frontend Setup
```bash
cd ../tenant-frontend
# Install dependencies
npm install
# Setup environment variables
# Create .env.local file with:
# NEXT_PUBLIC_BACKEND_URL=http://localhost:3000

# Start development server
npm run dev
```
Frontend runs on http://localhost:3001 (or port 3000 if 3001 is taken)

## Project Structure
```
Interview-Project/
├── tenant-backend/ # NestJS backend
│ ├── src/ # Source code
│ ├── prisma/ # Database schema
│ └── package.json
├── tenant-frontend/ # Next.js frontend
│ ├── app/ # App router pages
│ ├── components/ # React components
│ └── package.json
└── README.md
```

## Authentication Flow
1. **Sign Up** - Create new user account
2. **Organization** - Create or join organization
3. **Role Management** - Owner can invite members
4. **Workspace** - Access organization-specific data

## Database Schema
- **Users** - User accounts
- **Organizations** - Workspace entities
- **OrganizationMembers** - User-organization relationships
- **Outlines** - Document management system

## API Endpoints

All authentication endpoints are handled by Better Auth at `/api/auth/*`

### Authentication (Better Auth)
- `POST /api/auth/sign-up/email` - User registration
- `POST /api/auth/sign-in/email` - User login
- `POST /api/auth/sign-out` - User logout
- `GET /api/auth/session` - Get current session

### Organizations (Better Auth Organization Plugin)
- `POST /api/auth/organization/create` - Create organization
- `POST /api/auth/organization/invite-member` - Invite member
- `POST /api/auth/organization/accept-invitation` - Accept invitation
- `GET /api/auth/organization/list` - List user's organizations

### Outlines
- `GET /api/outlines` - List outlines for current organization
- `POST /api/outlines` - Create outline
- `PUT /api/outlines/:id` - Update outline
- `DELETE /api/outlines/:id` - Delete outline

### Team Management
- `GET /api/team/members` - List organization members
- `POST /api/team/invite` - Invite member (owner only)
- `POST /api/team/revoke` - Remove member (owner only)

## Roles & Permissions
- **Owner**: Full access, can invite/remove members
- **Member**: Read/write access to organization data

## Development
### Backend Commands
```bash
npm run start:dev # Development mode
npm run build # Build project
npm run test # Run tests
```

### Frontend Commands
```bash
npm run dev # Development mode
npm run build # Build project
npm run lint # Run ESLint
```

## Environment Variables

### Backend (.env)
```env
# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-key-here-change-in-production
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_BASE_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tenant_db

# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:3001

# Node Environment
NODE_ENV=development
```

### Frontend (.env.local)
```env
# Backend API URL (where NestJS is running)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000

# Mock Auth (optional - set to "true" to use mock auth)
NEXT_PUBLIC_USE_MOCK_AUTH=
```

## Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License
This project is for interview assessment purposes.

---

**To create this manually:**
1. Open a text editor (e.g., `nano README.md` or `vim README.md` in terminal).
2. Copy the entire content above (from `# Multi-Tenant...` to the end) and paste it into the file.
3. Save and exit (Ctrl+O, Enter, Ctrl+X for nano).

**Note on Logos:** Logos have been made minimal by resizing them to approximately 48px width/height where possible. The Better-Auth logo has been removed due to lack of a readily available official image URL; it's referenced as text only.

**For .env.example files:** (unchanged)
**tenant-backend/.env.example:**
```
DATABASE_URL="postgresql://username:password@localhost:5432/workspace_db"
BETTER_AUTH_SECRET="your-super-secret-key-change-in-production"
BETTER_AUTH_URL="http://localhost:3001"
PORT=3001
```

**tenant-frontend/.env.example:**
```
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"
```

Copy each block into their respective files using a text editor.