# Family Cabin Project Management

## 1. Project Summary

Family Cabin Project Management is a private web application for coordinating maintenance, improvement, and preparation work at a family-owned cabin. Family members can register, sign in, create projects, claim work for themselves, track completion, and publish announcements for the rest of the group.

The application should make it easy to answer three questions:

1. What needs to be done at the cabin?
2. Who is responsible for each project?
3. What information does the family need to know right now?

The visual direction is informed by the existing [dashboard mockup](./dashboard.jpg) and [project list mockup](./project-list.jpg): a calm cabin-inspired color palette, a dashboard with current projects and recent announcements, and a searchable project list.

## 2. Goals and Success Criteria

### Goals

- Replace informal, scattered task tracking with one shared project list.
- Make ownership visible so family members can volunteer for work.
- Give the family a clear record of completed work.
- Provide a central place for time-sensitive and general announcements.
- Keep the experience approachable for users with different technical skill levels.

### Initial success criteria

- A new family member can register and log in without administrator assistance.
- An authenticated user can create a project with a title, description, priority, and status.
- A user can assign an unassigned project to themselves and later mark it completed.
- Users can view active and completed projects separately.
- An authenticated user can post and read announcements.
- Unauthorized users cannot access private project or announcement data.
- Automated tests cover authentication, project ownership/status transitions, announcement posting, and the production smoke path.

## 3. Core Features (MVP)

### Authentication and account management

- User registration with name, email, and password.
- Login and logout.
- Password hashing and secure session or token management.
- Authenticated account settings, including display name and password change.
- Authorization checks on every private API route.

### Project management

- Create a project with:
  - Title
  - Description
  - Priority (`low`, `medium`, `high`, or `urgent`)
  - Optional due date
  - Optional image or attachment reference
- View projects in a dashboard and a full project list.
- Filter projects by status, priority, and assignment.
- Search projects by title and description.
- Assign an unassigned project to the current user.
- Allow the assigned user or an authorized family administrator to change assignment.
- Mark a project as completed and record completion time.
- Reopen a completed project when additional work is required.
- Display the assigned member, status, priority, and relevant dates.

### Announcements

- View recent announcements on the dashboard and in a dedicated list.
- Create an announcement with a title, body, and optional urgency flag.
- Edit or remove announcements authored by the current user or by an authorized administrator.
- Display author and publication timestamp.
- Visually distinguish urgent announcements.

### Dashboard

- Show active projects requiring attention.
- Show projects assigned to the signed-in user.
- Show recently completed projects.
- Show recent announcements, with urgent items first.
- Provide clear actions for “Create project,” “Claim project,” “Mark complete,” and “Post announcement.”

### Accessibility and responsive UI

- Responsive layouts for mobile, tablet, and desktop.
- Keyboard-accessible navigation, forms, menus, and dialogs.
- Visible focus states and sufficient color contrast.
- Labels and validation messages associated with form controls.
- Status and urgency communicated with text as well as color.

## 4. Additional Features for Consideration

These features should be evaluated after the MVP based on family usage and implementation capacity:

- Project comments and activity history.
- Multiple assignees or project collaborators.
- Project categories such as maintenance, cleaning, supplies, and improvement.
- Recurring seasonal projects, such as winterizing plumbing.
- File and photo uploads for receipts, instructions, and before/after documentation.
- Due-date reminders and email or push notifications.
- Calendar view of project due dates.
- Budget, estimated cost, actual cost, and receipt tracking.
- Announcement read/unread state and acknowledgements.
- Administrator invitation workflow and member approval.
- Role-based permissions beyond member and administrator.
- Offline-friendly mobile experience or installable PWA.
- Audit log and export to CSV/JSON.
- Dashboard metrics for completed work, overdue projects, and spending.

## 5. Recommended Technical Approach

The application should follow the repository's web application standards:

- **Frontend:** Astro or an equivalent modern multi-page build with HTML, CSS, and TypeScript; use Svelte 5 components only where interaction benefits from client-side behavior. Do not use Tailwind.
- **Backend:** Node.js with Express (or an equivalent Node HTTP framework) exposing a versioned REST API.
- **Database:** MongoDB or another document-oriented NoSQL database. The schema below uses MongoDB-style documents and indexes.
- **Authentication:** Server-managed secure cookies are preferred for a private family application. Passwords must be hashed with a modern password-hashing library; credentials and cookie secrets must come from environment variables.
- **Validation:** Validate request bodies and query parameters at the API boundary.
- **Operations:** Structured server logs, health checks, reproducible builds, and CI checks for tests, linting, formatting, dependency vulnerabilities, and a production smoke test.

## 6. Recommended Project Folder Structure

```text
/
├── docs/
│   ├── dashboard.jpg
│   ├── project-list.jpg
│   └── project-proposal.md
├── public/
│   ├── images/
│   └── favicon.svg
├── src/
│   ├── pages/                         # Astro pages and route-level UI
│   │   ├── index.astro
│   │   ├── login.astro
│   │   ├── register.astro
│   │   ├── dashboard.astro
│   │   ├── projects/
│   │   │   ├── index.astro
│   │   │   └── [id].astro
│   │   └── announcements.astro
│   ├── components/                    # Shared UI and Svelte islands
│   ├── layouts/
│   ├── styles/
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── auth.ts
│   │   └── validation.ts
│   └── types/
├── server/
│   ├── app.ts
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── project.routes.ts
│   │   ├── announcement.routes.ts
│   │   └── user.routes.ts
│   ├── controllers/
│   ├── services/
│   ├── models/
│   └── db/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── components/
│   └── smoke/
├── .env.example
├── package.json
└── README.md
```

The exact framework directories may change during implementation, but frontend presentation, backend HTTP concerns, business logic, persistence, and tests should remain separated.

## 7. Initial Database Schema

All documents should include `createdAt` and `updatedAt` timestamps. MongoDB ObjectIds are represented as `ObjectId` below.

### `users`

```js
{
  _id: ObjectId,
  name: String,                 // required
  email: String,                // required, normalized and unique
  passwordHash: String,         // required; never returned by API
  role: "member" | "admin",     // default: "member"
  isActive: Boolean,            // default: true
  lastLoginAt: Date | null,
  createdAt: Date,
  updatedAt: Date
}
```

Indexes: unique index on `email`; index on `isActive`.

### `projects`

```js
{
  _id: ObjectId,
  title: String,                         // required
  description: String,                  // required
  status: "open" | "in_progress" | "completed",
  priority: "low" | "medium" | "high" | "urgent",
  assigneeId: ObjectId | null,          // references users._id
  createdById: ObjectId,                // references users._id
  dueDate: Date | null,
  completedAt: Date | null,
  attachmentUrls: [String],
  createdAt: Date,
  updatedAt: Date
}
```

Indexes: compound index on `{ status: 1, priority: -1, updatedAt: -1 }`, index on `assigneeId`, and text/search indexes for `title` and `description` where supported.

### `announcements`

```js
{
  _id: ObjectId,
  title: String,                         // required
  body: String,                          // required
  isUrgent: Boolean,                    // default: false
  authorId: ObjectId,                   // references users._id
  publishedAt: Date,
  updatedAt: Date,
  createdAt: Date
}
```

Indexes: compound index on `{ isUrgent: -1, publishedAt: -1 }` and index on `authorId`.

### Optional later collection: `project_activity`

If an audit trail is added, store immutable events such as assignment changes, status changes, edits, and completion:

```js
{
  _id: ObjectId,
  projectId: ObjectId,
  actorId: ObjectId,
  action: "created" | "assigned" | "unassigned" | "status_changed" | "updated",
  metadata: Object,
  createdAt: Date
}
```

## 8. API Endpoints

All endpoints are under `/api/v1`. JSON is the default request and response format. Private endpoints require authentication.

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/auth/register` | Create a member account and establish a session |
| `POST` | `/auth/login` | Authenticate a user and establish a session |
| `POST` | `/auth/logout` | Destroy the current session |
| `GET` | `/auth/me` | Return the authenticated user's safe profile |
| `PATCH` | `/users/me` | Update the current user's name or password |

### Projects

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/projects` | List projects with `status`, `priority`, `assignee`, `search`, `sort`, `page`, and `limit` filters |
| `POST` | `/projects` | Create a project |
| `GET` | `/projects/:projectId` | Return one project and its display metadata |
| `PATCH` | `/projects/:projectId` | Update project fields allowed to the current user |
| `DELETE` | `/projects/:projectId` | Archive or remove a project according to authorization policy |
| `POST` | `/projects/:projectId/claim` | Assign the project to the current user |
| `DELETE` | `/projects/:projectId/assignee` | Remove the current user's assignment when permitted |
| `POST` | `/projects/:projectId/complete` | Mark a project completed and set `completedAt` |
| `POST` | `/projects/:projectId/reopen` | Move a completed project back to `open` |

### Announcements

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/announcements` | List announcements with pagination and optional urgent filter |
| `POST` | `/announcements` | Publish an announcement |
| `GET` | `/announcements/:announcementId` | Return one announcement |
| `PATCH` | `/announcements/:announcementId` | Edit an announcement when authorized |
| `DELETE` | `/announcements/:announcementId` | Remove an announcement when authorized |

### Operational

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Return service and database readiness for deployment checks |

### API behavior standards

- Return consistent JSON error objects with an error code, message, and optional field errors.
- Use `201 Created` for successful creation, `204 No Content` for successful deletion/logout where appropriate, and `401`, `403`, `404`, `409`, and `422` for their corresponding failure cases.
- Never return `passwordHash`, session secrets, or other sensitive fields.
- Enforce ownership and role checks in the server, not only in the UI.
- Sanitize or safely render user-provided announcement and project content to prevent XSS.
- Apply rate limiting to registration and login, and use CSRF protection when cookie-based authentication is used.

## 9. Delivery Plan

### Phase 1: Foundation

- Set up the frontend build, backend server, environment configuration, database connection, linting, formatting, and CI.
- Add shared error handling, validation, logging, and authentication middleware.

### Phase 2: Authentication

- Implement registration, login, logout, current-user lookup, and account settings.
- Add unit and integration tests for valid, invalid, duplicate, and unauthorized authentication flows.

### Phase 3: Projects

- Implement project persistence and REST endpoints.
- Build dashboard, project list, project creation, project detail, claim, completion, filtering, and search experiences.
- Add tests for assignment rules, status transitions, validation, and authorization.

### Phase 4: Announcements and polish

- Implement announcement endpoints and UI.
- Add responsive and accessible states, urgent announcement treatment, loading states, and error handling.
- Add component tests, integration tests, and the production smoke test.

### Phase 5: Release readiness

- Run the full CI quality gate.
- Verify environment-variable documentation and deployment configuration.
- Perform a short family usability review using the dashboard and project-list flows.

## 10. Testing Strategy

- **Unit tests:** validation, authorization policies, project status transitions, password handling, and service-layer logic.
- **Integration tests:** registration/login, project creation and claiming, completion/reopen behavior, announcement publishing, and persistence.
- **Component tests:** forms, project cards, filters, dashboard summaries, announcement cards, accessible error states.
- **Smoke test:** production build starts, serves the main page, and can reach the health endpoint.
- **Security checks:** dependency vulnerability scan, authentication rate-limit tests, authorization tests, and checks that sensitive fields are excluded from responses.

## 11. Out of Scope for the Initial Release

- Public access to cabin data.
- Real-time chat or messaging.
- Payments or vendor management.
- Automatic weather integrations.
- Complex multi-cabin tenancy.
- Native mobile applications.

Keeping these items out of the MVP preserves a simple, maintainable product while leaving clear extension points for the family’s future needs.
