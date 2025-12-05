 
# 🏢 Tenant Backend API

Multi-tenant backend service for organization collaboration built with **NestJS**.

[![Status](https://img.shields.io/badge/status-active-success)](https://github.com/hailemichael121/Interview-Project)
[![Deployed](https://img.shields.io/badge/deployed-Render-blue)](https://tenant-backend-cz23.onrender.com)

---

## 🚀 Quick Start

To set up and run the service locally:

```bash
git clone  ttps://github.com/hailemichael121/Interview-Project.git
cd Interview-Project/tenant-backend
npm install
cp .env.example .env
npm run db:migrate
npm run start:dev
````

### Environment Variables (`.env`)

Configure your environment variables in the newly created `.env` file:

```env
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/tenant_db
AUTH_SECRET=your-secret-key-here
CORS_ORIGIN=http://localhost:3000
```

-----

## 💻 Development Commands

| Command | Description |
| :--- | :--- |
| `npm run start:dev` | Starts the application in **development** mode (watches files). |
| `npm run build` | Compiles the TypeScript code to JavaScript. |
| `npm run start:prod` | Runs the compiled application in **production** mode. |
| `npm run test` | Runs **unit tests**. |
| `npm run test:e2e` | Runs **end-to-end tests**. |

### Database Commands

| Command | Description |
| :--- | :--- |
| `npm run db:migrate` | Executes pending **database migrations**. |
| `npm run db:seed` | **Seeds** the database with initial data (if defined). |
| `npm run db:studio` | Opens **Prisma Studio** for database inspection. |

-----

## 🧪 API Testing

### Base URLs

  * **Production**: `https://tenant-backend-cz23.onrender.com`
  * **Development**: `http://localhost:4000`

### Authentication Notes

  * Uses **cookie-based sessions** (`better-auth.session_token`).
  * The **session token** must be extracted from the sign-in response and included in subsequent requests.
  * The **`Origin`** header must match the configured frontend URL.
  * All organization-scoped endpoints require the **`X-Organization-Id`** header.

### API Endpoint List

| \# | Method | Endpoint | Description | Requires Auth/Org ID |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/` | Health Check | No |
| 2 | `POST` | `/api/auth/sign-up/email` | Register a new user. | No |
| 3 | `POST` | `/api/auth/sign-in/email` | Authenticate a user and set session cookie. | No |
| 4 | `GET` | `/users/me` | Get current authenticated user details. | Auth |
| 5 | `POST` | `/api/organization/create` | Create a new organization. | Auth |
| 6 | `GET` | `/api/organization` | List user's organizations. | Auth |
| 7 | `POST` | `/api/organization/:organizationId/switch` | Set the active organization for the session. | Auth |
| 8 | `POST` | `/api/organization/:organizationId/invite` | Invite a member to an organization. | Auth, Org ID |
| 9 | `POST` | `/api/outlines` | Create a new outline within the active organization. | Auth, Org ID |
| 10 | `GET` | `/api/outlines?organizationId=:organizationId` | List outlines for the organization. | Auth, Org ID |

### Testing File Example (`api-test.rest`)

You can save the following content as `api-test.rest` and use the VS Code REST Client extension, or adapt it for tools like Postman/Insomnia.

```http
@baseUrl = [https://tenant-backend-cz23.onrender.com](https://tenant-backend-cz23.onrender.com)
@frontendUrl = [https://tenanncy.onrender.com](https://tenanncy.onrender.com)
@contentType = application/json

# REPLACE with the session token from your sign-in response
@authToken = your-session-token-here

# REPLACE with an Organization ID after creation/listing
@organizationId = 12345

### 1. Health Check
GET {{baseUrl}}/

### 2. Sign Up
POST {{baseUrl}}/api/auth/sign-up/email
Origin: {{frontendUrl}}
Content-Type: {{contentType}}

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}

### 3. Sign In
POST {{baseUrl}}/api/auth/sign-in/email
Origin: {{frontendUrl}}
Content-Type: {{contentType}}

{
  "email": "test@example.com",
  "password": "password123"
}

### 4. Get Current User
GET {{baseUrl}}/users/me
Origin: {{frontendUrl}}
Cookie: better-auth.session_token={{authToken}}

### 5. Create Organization
POST {{baseUrl}}/api/organization/create
Origin: {{frontendUrl}}
Content-Type: {{contentType}}
Cookie: better-auth.session_token={{authToken}}

{
  "name": "My Organization",
  "slug": "my-org"
}

### 6. List User Organizations
GET {{baseUrl}}/api/organization
Origin: {{frontendUrl}}
Cookie: better-auth.session_token={{authToken}}

### 7. Switch Organization (Use an ID from listing above)
POST {{baseUrl}}/api/organization/{{organizationId}}/switch
Origin: {{frontendUrl}}
Cookie: better-auth.session_token={{authToken}}

### 8. Invite Member
POST {{baseUrl}}/api/organization/{{organizationId}}/invite
Origin: {{frontendUrl}}
Content-Type: {{contentType}}
Cookie: better-auth.session_token={{authToken}}
X-Organization-Id: {{organizationId}}

{
  "email": "member@example.com",
  "role": "MEMBER"
}

### 9. Create Outline
POST {{baseUrl}}/api/outlines
Origin: {{frontendUrl}}
Content-Type: {{contentType}}
Cookie: better-auth.session_token={{authToken}}
X-Organization-Id: {{organizationId}}

{
  "header": "Project Outline",
  "sectionType": "EXECUTIVE_SUMMARY",
  "target": 1000,
  "organizationId": "{{organizationId}}"
}

### 10. List Outlines
GET {{baseUrl}}/api/outlines?organizationId={{organizationId}}
Origin: {{frontendUrl}}
Cookie: better-auth.session_token={{authToken}}
X-Organization-Id: {{organizationId}}
```

-----

## ☁️ Deployment (Render.com)

The service is configured for deployment on platforms like Render.com.

### Build & Start Commands

```bash
# Build Command
npm install && npm run build

# Start Command
npm run start:prod
```

### Required Environment Variables

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | Connection string for your PostgreSQL database. |
| `AUTH_SECRET` | Secret key for JWT/session token signing. |
| `CORS_ORIGIN` | The URL of your frontend (e.g., `https://your-frontend.vercel.app`). |
| `NODE_ENV` | Should be set to `production`. |

-----

## 🛠️ Common Issues Troubleshooting

### ⚠️ Session Errors

  * Ensure **cookies** are enabled in your API client.
  * Always include the required **`Origin`** header.
  * Verify that your session token (`better-auth.session_token`) has not **expired**.

### ⚠️ Organization Errors

  * Ensure the **`X-Organization-Id`** header is included for all organization-scoped endpoints.
  * Confirm you have successfully used the `/switch` endpoint for the desired organization ID before accessing organization resources.

### ⚠️ CORS Errors

  * Set the **correct `Origin`** header:
      * Development: `http://localhost:3000`
      * Production: `https://your-frontend.vercel.app` (or your actual frontend URL)

-----

## 🔗 Support

  * **Repository:** [https://github.com/hailemichael121/Interview-Project](https://github.com/hailemichael121/Interview-Project)
  * **Backend Directory:** `/tenant-backend`
  * **Health Check:** `GET /` returns `{"status":"healthy"}`

 