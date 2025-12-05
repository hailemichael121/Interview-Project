 
# 💻 Tenant Frontend

Multi-tenant collaboration frontend built with **Next.js 14** and **TypeScript** using the App Router.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Deployed](https://img.shields.io/badge/deployed-Vercel-black)](https://tenanncy.onrender.com)

---

## 🚀 Quick Start

To clone and run the project locally:

```bash
git clone https://github.com/hailemichael121/Interview-Project.git
cd Interview-Project/tenant-frontend
npm install
npm run dev
````

The application will be accessible at [**http://localhost:3000**](https://www.google.com/search?q=http://localhost:3000).

### Environment Setup

Create a file named `.env.local` in the project root and specify the backend API URL:

```env
NEXT_PUBLIC_BACKEND_URL=[https://tenant-backend-cz23.onrender.com](https://tenant-backend-cz23.onrender.com)
```

-----

## 🛠️ Development Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the **development server** with hot reloading. |
| `npm run build` | Creates the **production build** of the application. |
| `npm run start` | Starts the built application in **production mode**. |
| `npm run lint` | Runs **ESLint** to lint the code. |

-----

## 📂 Project Structure

The project follows the standard **Next.js App Router** structure:

```
tenant-frontend/
├── app/                  # Next.js app router pages & layouts
│   ├── auth/             # Authentication pages (Sign In, Sign Up)
│   ├── dashboard/        # Main workspace/dashboard area
│   ├── organization/     # Organization creation and joining pages
│   └── outlines/         # Outline management pages
├── components/           # Reusable UI components (Tailwind + shadcn/ui)
├── hooks/                # Custom React hooks (e.g., useAuth)
├── lib/                  # Utilities, configuration, and API service
└── public/               # Static assets (images, favicon)
```

### Key Components

  * `ProtectedRoute`: Guards routes, ensuring the user is authenticated.
  * `PublicRoute`: Redirects authenticated users away from public pages (like sign-in).
  * `DashboardLayout`: The main layout providing the sidebar and navigation.
  * `AppSidebar`: Component handling organization switching and main navigation.

### Key Pages

| Path | Description |
| :--- | :--- |
| `/` | Landing page. |
| `/auth/signin` | User sign-in page. |
| `/auth/signup` | User sign-up page. |
| `/dashboard` | Main application workspace. |
| `/organization/create` | Page to create a new organization. |
| `/organization/join` | Page to join an existing organization. |
| `/outlines` | Page for outline and project management. |

-----

## ✨ Features

  * **Authentication**: Email/password sign-in with **secure cookie-based sessions**.
  * **Organization Management**: Ability to **create, join, and seamlessly switch** between workspaces.
  * **Team Collaboration**: Functionality to **invite members** and manage user roles.
  * **Outline Management**: Core features to create, edit, and track project outlines.
  * **Multi-tenant**: Ensures **isolated data** and context per selected organization.

-----

## 🔗 API Integration and Proxy

The frontend connects to the backend API via a **Next.js API proxy** to manage complexity and handle cookie forwarding.

| Environment | Frontend Proxy URL | Backend Destination |
| :--- | :--- | :--- |
| **Local** | `http://localhost:3000/api/*` | `https://tenant-backend-cz23.onrender.com/api/*` |
| **Production** | `https://tenanncy.onrender.com/api/*` | `https://tenant-backend-cz23.onrender.com/api/*` |

### Authentication Flow

1.  User submits credentials at `/auth/signin`.
2.  The request is proxied to the backend, which sets a secure **session cookie** (`better-auth.session_token`).
3.  The cookie is set automatically in the user's browser.
4.  All subsequent requests to protected endpoints automatically include this session cookie via the proxy.

### Example API Usage

API calls are handled through a custom service (e.g., `apiService`) that abstracts away the proxy routing:

```typescript
// Using the built-in API service
import { apiService } from "@/lib/api-service";

// Get user profile
const profile = await apiService.user.getProfile();

// Create organization
const org = await apiService.organization.createOrganization({
  name: "My Team",
  slug: "my-team"
});

// List outlines
const outlines = await apiService.outline.listOutlines(orgId);
```

### Testing Frontend Proxy (`frontend-api-test.rest`)

You can save this content as `frontend-api-test.rest` for testing with the VS Code REST Client:

```http
@frontendUrl = http://localhost:3000
@backendUrl = [https://tenant-backend-cz23.onrender.com](https://tenant-backend-cz23.onrender.com)

### 1. Test Frontend Proxy (Should hit the backend health check)
GET {{frontendUrl}}/api/

### 2. Sign In via Frontend Proxy
POST {{frontendUrl}}/api/auth/sign-in/email
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

### 3. Test Backend Directly (for comparison/debugging)
GET {{backendUrl}}/
```

-----

## ☁️ Deployment

### Vercel (Recommended)

The project is designed for seamless deployment on **Vercel**.

1.  Connect your GitHub repository to Vercel.
2.  Set the required environment variable:
    ```env
    NEXT_PUBLIC_BACKEND_URL=[https://tenant-backend-cz23.onrender.com](https://tenant-backend-cz23.onrender.com)
    ```

The live demo is deployed at: [**https://tenanncy.onrender.com**](https://tenanncy.onrender.com)

-----

## ❓ Common Issues

### Session/Cookie Issues

  * Ensure **cookies are enabled** in your browser/client.
  * Verify that the **backend API** is running and accessible at the specified URL.
  * Try **clearing browser cookies** if authentication behavior is inconsistent.

### CORS Errors

  * The Next.js proxy is designed to prevent these errors. If they occur, check that your **`NEXT_PUBLIC_BACKEND_URL`** is correct and that the backend is configured to accept requests from your frontend's domain.
  * The backend expects `Origin: http://localhost:3000` in development.

### Build Errors

If you encounter build issues, try a fresh rebuild:

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

-----

## 📚 Development Notes

  * **Framework**: Next.js 14 (App Router)
  * **Language**: TypeScript
  * **Styling**: Tailwind CSS
  * **UI Components**: shadcn/ui
  * **Authentication**: Better Auth principles for session management

### Repository Links

  * **Full Project**: [https://github.com/hailemichael121/Interview-Project](https://github.com/hailemichael121/Interview-Project)
  * **Backend Directory**: `/tenant-backend`
  * **Live Demo**: [https://tenanncy.onrender.com](https://tenanncy.onrender.com)

-----
 