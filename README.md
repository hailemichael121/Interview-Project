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
# Setup environment
cp .env.example .env
# Edit .env with your database URL
# Database setup
npx prisma generate
npx prisma migrate dev --name init
# Start development server
npm run start:dev
```
Backend runs on http://localhost:3001

### 3. Frontend Setup
```bash
cd ../tenant-frontend
# Install dependencies
npm install
# Setup environment
cp .env.example .env.local
# Edit .env.local with your backend URL
# Start development server
npm run dev
```
Frontend runs on http://localhost:3000

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
### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Organizations
- `POST /organizations` - Create organization
- `GET /organizations` - List user's organizations
- `POST /organizations/invite` - Invite member

### Outlines
- `GET /organizations/:id/outlines` - List outlines
- `POST /organizations/:id/outlines` - Create outline
- `PUT /organizations/:id/outlines/:id` - Update outline
- `DELETE /organizations/:id/outlines/:id` - Delete outline

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
DATABASE_URL="postgresql://user:password@localhost:5432/workspace_db"
BETTER_AUTH_SECRET="your-auth-secret"
BETTER_AUTH_URL="http://localhost:3001"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"
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