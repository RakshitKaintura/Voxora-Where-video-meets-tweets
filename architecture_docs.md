# 🏗️ YouTube Clone — Architecture Documentation

> **Author:** Rakshit Kaintura  
> **Last Updated:** July 2026  
> **Stack:** React 19 · Express 5 · MongoDB · Cloudinary · Gemini AI

---

## Table of Contents

1. [High-Level Architecture Diagram](#1-high-level-architecture-diagram)
2. [ER Diagram (Database Schema)](#2-er-diagram-database-schema)
3. [Authentication Flow](#3-authentication-flow)
4. [Request / Sequence Flow](#4-request--sequence-flow)
5. [Technology Decision Sheet](#5-technology-decision-sheet)

---

## 1. High-Level Architecture Diagram

The system follows a **client-server architecture** with a React SPA communicating with an Express REST API. Media assets are offloaded to Cloudinary, data is persisted in MongoDB Atlas, and AI features are powered by Google Gemini.

```mermaid
graph TB
    subgraph CLIENT ["🖥️ Frontend — React SPA (Vite)"]
        direction TB
        UI["React 19 Components"]
        RR["React Router v7"]
        RQ["TanStack React Query"]
        RD["Redux Toolkit"]
        AX["Axios HTTP Client"]

        UI --> RR
        UI --> RQ
        UI --> RD
        RQ --> AX
    end

    subgraph SERVER ["⚙️ Backend — Express 5 API"]
        direction TB
        MW["Middleware Layer\n(CORS · Cookie Parser · JSON · Multer)"]
        AUTH["Auth Middleware\n(JWT Verification)"]
        ROUTES["Route Layer\n(/api/v1/*)"]
        CTRL["Controller Layer"]
        UTILS["Utilities\n(ApiError · ApiResponse · asyncHandler)"]

        MW --> AUTH
        AUTH --> ROUTES
        ROUTES --> CTRL
        CTRL --> UTILS
    end

    subgraph SERVICES ["☁️ External Services"]
        MONGO[("MongoDB Atlas\n(Mongoose ODM)")]
        CLOUD["Cloudinary\n(Video · Image · Thumbnail)"]
        GEMINI["Google Gemini AI\n(Captions · Summaries\nMetadata Generation)"]
    end

    AX -- "HTTP/REST\n(Cookies + JSON)" --> MW
    CTRL --> MONGO
    CTRL --> CLOUD
    CTRL --> GEMINI

    style CLIENT fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#e2e8f0
    style SERVER fill:#1e1b2e,stroke:#a855f7,stroke-width:2px,color:#e2e8f0
    style SERVICES fill:#1a1a2e,stroke:#10b981,stroke-width:2px,color:#e2e8f0
```

### Layer Breakdown

| Layer | Responsibility |
|---|---|
| **React SPA** | UI rendering, routing, client state (Redux), server state (React Query) |
| **Axios Client** | API calls with automatic 401 → refresh-token retry interceptor |
| **Express Middleware** | CORS, body parsing (50 MB limit), cookie parsing, static file serving |
| **Auth Middleware** | JWT access-token verification from cookies or `Authorization` header |
| **Route → Controller** | RESTful endpoints mapped to business logic handlers |
| **Cloudinary** | Video/image upload, storage, and CDN delivery |
| **Google Gemini** | AI-powered caption generation, video summaries, and metadata generation |
| **MongoDB** | Document-based persistence via Mongoose with aggregate pagination |

---

## 2. ER Diagram (Database Schema)

All models use Mongoose schemas with `timestamps: true` (auto `createdAt` / `updatedAt`).

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        String username UK "lowercase, indexed"
        String email UK "lowercase"
        String fullName "indexed"
        String avatar "Cloudinary URL, required"
        String coverImage "Cloudinary URL"
        String password "bcrypt hashed"
        String refreshToken
        ObjectId[] watchHistory "refs Video"
        Date createdAt
        Date updatedAt
    }

    VIDEO {
        ObjectId _id PK
        String videoFile "Cloudinary URL, required"
        String thumbnail "Cloudinary URL, required"
        String title "required"
        String description "required"
        Number duration "required"
        String captions "WebVTT subtitle data"
        String summary "AI-generated summary"
        Number views "default 0"
        Boolean isPublished "default true"
        ObjectId owner FK "refs User"
        Date createdAt
        Date updatedAt
    }

    COMMENT {
        ObjectId _id PK
        String content "required"
        ObjectId video FK "refs Video"
        ObjectId owner FK "refs User"
        ObjectId parentComment FK "refs Comment, nullable"
        Date createdAt
        Date updatedAt
    }

    LIKE {
        ObjectId _id PK
        ObjectId video FK "refs Video, nullable"
        ObjectId comment FK "refs Comment, nullable"
        ObjectId tweet FK "refs Tweet, nullable"
        ObjectId likedBy FK "refs User"
        Date createdAt
        Date updatedAt
    }

    TWEET {
        ObjectId _id PK
        String content "required"
        String image "Cloudinary URL, nullable"
        ObjectId owner FK "refs User"
        ObjectId parentTweet FK "refs Tweet, nullable"
        Date createdAt
        Date updatedAt
    }

    PLAYLIST {
        ObjectId _id PK
        String name "required"
        String description "required"
        ObjectId[] videos "refs Video"
        ObjectId owner FK "refs User"
        String type "enum: personal, creator"
        Date createdAt
        Date updatedAt
    }

    SUBSCRIPTION {
        ObjectId _id PK
        ObjectId subscriber FK "refs User"
        ObjectId channel FK "refs User"
        Date createdAt
        Date updatedAt
    }

    USER ||--o{ VIDEO : "owns"
    USER ||--o{ COMMENT : "writes"
    USER ||--o{ TWEET : "posts"
    USER ||--o{ LIKE : "gives"
    USER ||--o{ PLAYLIST : "creates"
    USER ||--o{ SUBSCRIPTION : "subscribes"
    USER ||--o{ SUBSCRIPTION : "receives"
    USER }o--o{ VIDEO : "watchHistory"

    VIDEO ||--o{ COMMENT : "has"
    VIDEO ||--o{ LIKE : "receives"
    PLAYLIST }o--o{ VIDEO : "contains"

    COMMENT ||--o{ LIKE : "receives"
    COMMENT ||--o{ COMMENT : "replies"

    TWEET ||--o{ LIKE : "receives"
    TWEET ||--o{ TWEET : "replies"
```

### Schema Notes

| Model | Special Features |
|---|---|
| **User** | Pre-save hook hashes password via `bcrypt(10)`. Methods: `isPasswordCorrect()`, `generateAccessToken()`, `generateRefreshToken()` |
| **Video** | Uses `mongoose-aggregate-paginate-v2` for paginated queries. Stores AI-generated `captions` (WebVTT) and `summary` |
| **Comment** | Supports nested replies via self-referencing `parentComment` field |
| **Like** | Polymorphic — a single Like doc can reference a Video, Comment, OR Tweet (only one is set) |
| **Tweet** | Community post system with optional image and threaded replies via `parentTweet` |
| **Playlist** | Typed as `personal` (saved/watch-later) or `creator` (channel playlists) |
| **Subscription** | Join table: `subscriber` (who subscribes) → `channel` (who they subscribe to) — both reference User |

---

## 3. Authentication Flow

The system uses a **dual-token JWT strategy** with HTTP-only cookies for security.

```mermaid
sequenceDiagram
    autonumber
    participant C as 🖥️ React Client
    participant AX as 📡 Axios Interceptor
    participant S as ⚙️ Express Server
    participant MW as 🔐 Auth Middleware
    participant DB as 🗄️ MongoDB

    Note over C,DB: ━━━ REGISTRATION FLOW ━━━

    C->>S: POST /api/v1/users/register
    Note right of C: FormData: fullName, email,<br/>username, password,<br/>avatar (file), coverImage (file)
    S->>S: Multer parses files
    S->>S: Validate fields + check duplicates
    S->>S: Upload avatar & coverImage to Cloudinary
    S->>DB: Create User document (password auto-hashed via pre-save hook)
    DB-->>S: User created
    S-->>C: 201 { user } (excludes password & refreshToken)

    Note over C,DB: ━━━ LOGIN FLOW ━━━

    C->>S: POST /api/v1/users/login
    Note right of C: { email, username, password }
    S->>DB: Find user by email or username
    DB-->>S: User document
    S->>S: bcrypt.compare(password, hash)
    S->>S: Generate accessToken (JWT with _id, email, username, fullName)
    S->>S: Generate refreshToken (JWT with _id only)
    S->>DB: Save refreshToken to user document
    S-->>C: 200 Set-Cookie: accessToken (httpOnly, secure)<br/>Set-Cookie: refreshToken (httpOnly, secure)<br/>Body: { user, accessToken, refreshToken }

    Note over C,DB: ━━━ AUTHENTICATED REQUEST ━━━

    C->>AX: Make API call
    AX->>S: Request with cookies attached
    S->>MW: verifyJWT middleware
    MW->>MW: Extract token from cookie or Authorization header
    MW->>MW: jwt.verify(token, ACCESS_TOKEN_SECRET)
    MW->>DB: Find user by decoded _id
    DB-->>MW: User (without password & refreshToken)
    MW->>MW: Attach user to req.user
    MW-->>S: next()
    S-->>C: Response data

    Note over C,DB: ━━━ TOKEN REFRESH FLOW (Automatic) ━━━

    C->>AX: API call → receives 401
    AX->>AX: Interceptor catches 401 (not a retry, not refresh endpoint)
    AX->>S: POST /api/v1/users/refresh-token
    Note right of AX: Sends refreshToken via cookie
    S->>S: jwt.verify(refreshToken, REFRESH_TOKEN_SECRET)
    S->>DB: Find user, compare stored refreshToken
    S->>S: Generate new accessToken + refreshToken pair
    S->>DB: Save new refreshToken
    S-->>AX: 200 Set-Cookie: new tokens
    AX->>S: Retry original request with new cookies
    S-->>C: Original response data

    Note over C,DB: ━━━ LOGOUT FLOW ━━━

    C->>S: POST /api/v1/users/logout (with verifyJWT)
    S->>DB: $unset refreshToken from user doc
    S-->>C: 200 Clear-Cookie: accessToken, refreshToken
```

### Key Security Decisions

| Aspect | Implementation |
|---|---|
| **Password Storage** | Hashed with `bcrypt` (salt rounds: 10) via Mongoose pre-save hook |
| **Access Token** | Short-lived JWT containing `_id`, `email`, `username`, `fullName` |
| **Refresh Token** | Longer-lived JWT containing only `_id`, stored in DB for revocation |
| **Cookie Settings** | `httpOnly: true` (no JS access), `secure: true` (HTTPS only) |
| **Token Delivery** | Dual: sent as HTTP-only cookies AND in response body |
| **Auto-Refresh** | Axios interceptor catches 401 → calls `/refresh-token` → retries original request |
| **Refresh Failure** | Clears Redux auth state → redirects to `/login` |
| **Route Protection** | Frontend: `<ProtectedRoute>` + `<GuestRoute>` components. Backend: `verifyJWT` middleware |

---

## 4. Request / Sequence Flow

### 4.1 — Video Upload Flow

```mermaid
sequenceDiagram
    autonumber
    participant U as 👤 User
    participant FE as 🖥️ React Frontend
    participant BE as ⚙️ Express Backend
    participant MU as 📁 Multer
    participant CL as ☁️ Cloudinary
    participant AI as 🤖 Google Gemini
    participant DB as 🗄️ MongoDB

    U->>FE: Fill upload form (title, description, video file, thumbnail)
    FE->>BE: POST /api/v1/videos (multipart/form-data)
    BE->>BE: verifyJWT → authenticate user
    BE->>MU: Parse uploaded files
    MU-->>BE: videoFile + thumbnail saved to /public/temp
    BE->>CL: Upload videoFile to Cloudinary
    CL-->>BE: { url, duration }
    BE->>CL: Upload thumbnail to Cloudinary
    CL-->>BE: { url }
    BE->>AI: Generate captions from video (Gemini)
    AI-->>BE: WebVTT caption data
    BE->>AI: Generate 3-bullet summary (Gemini)
    AI-->>BE: Summary text
    BE->>DB: Create Video document
    DB-->>BE: Saved video
    BE-->>FE: 201 { video }
    FE-->>U: Navigate to video / show success
```

### 4.2 — Video Watch Flow

```mermaid
sequenceDiagram
    autonumber
    participant U as 👤 User
    participant FE as 🖥️ React Frontend
    participant RQ as 🔄 React Query
    participant BE as ⚙️ Express Backend
    participant DB as 🗄️ MongoDB

    U->>FE: Click on video card
    FE->>FE: React Router navigates to /watch/:videoId
    FE->>RQ: useQuery triggers data fetch
    
    par Parallel Requests
        RQ->>BE: GET /api/v1/videos/:videoId
        BE->>BE: verifyJWT
        BE->>DB: Aggregation pipeline (lookup owner, count likes, check subscription)
        BE->>DB: Increment views, push to user watchHistory
        DB-->>BE: Video with owner details
        BE-->>RQ: { video }
    and
        RQ->>BE: GET /api/v1/comments/:videoId
        BE->>DB: Paginated aggregate (lookup owner, count likes per comment)
        DB-->>BE: Comments array
        BE-->>RQ: { comments }
    end

    RQ-->>FE: Cache & provide data
    FE-->>U: Render video player + comments + sidebar
```

### 4.3 — General API Request Lifecycle

```mermaid
graph LR
    A["Client Request"] --> B["CORS Middleware"]
    B --> C["Body Parsers\n(JSON / URL-encoded)"]
    C --> D["Cookie Parser"]
    D --> E["Static Files\n(/public)"]
    E --> F{"Route Matched?"}
    F -- Yes --> G["Multer\n(if file upload)"]
    G --> H["verifyJWT\n(if protected)"]
    H --> I["Controller"]
    I --> J{"Success?"}
    J -- Yes --> K["ApiResponse\n(200/201)"]
    J -- No --> L["throw ApiError"]
    F -- No --> M["404"]
    L --> N["Global Error Handler"]
    N --> O["Structured Error JSON"]

    style A fill:#3b82f6,stroke:#1d4ed8,color:#fff
    style K fill:#10b981,stroke:#059669,color:#fff
    style O fill:#ef4444,stroke:#dc2626,color:#fff
    style N fill:#f59e0b,stroke:#d97706,color:#000
```

### API Endpoints Summary

| Module | Endpoint | Methods | Auth Required |
|---|---|---|---|
| **Healthcheck** | `/api/v1/healthcheck` | GET | ❌ |
| **Users** | `/api/v1/users/register` | POST | ❌ |
| | `/api/v1/users/login` | POST | ❌ |
| | `/api/v1/users/logout` | POST | ✅ |
| | `/api/v1/users/refresh-token` | POST | ❌ |
| | `/api/v1/users/current-user` | GET | ✅ |
| | `/api/v1/users/change-password` | POST | ✅ |
| | `/api/v1/users/update-account` | PATCH | ✅ |
| | `/api/v1/users/avatar` | PATCH | ✅ |
| | `/api/v1/users/cover-image` | PATCH | ✅ |
| | `/api/v1/users/c/:username` | GET | ✅ |
| | `/api/v1/users/history` | GET | ✅ |
| **Videos** | `/api/v1/videos` | GET, POST | ✅ |
| | `/api/v1/videos/:videoId` | GET, PATCH, DELETE | ✅ |
| | `/api/v1/videos/toggle/publish/:videoId` | PATCH | ✅ |
| | `/api/v1/videos/:videoId/summary` | GET | ✅ |
| | `/api/v1/videos/generate-metadata` | POST | ✅ |
| **Comments** | `/api/v1/comments/:videoId` | GET, POST | ✅ |
| **Likes** | `/api/v1/likes/*` | POST/GET | ✅ |
| **Tweets** | `/api/v1/tweets` | GET, POST, PATCH, DELETE | ✅ |
| **Subscriptions** | `/api/v1/subscriptions/*` | POST, GET | ✅ |
| **Playlists** | `/api/v1/playlist` | CRUD | ✅ |
| **Dashboard** | `/api/v1/dashboard` | GET | ✅ |

---

## 5. Technology Decision Sheet

### Backend Stack

| Technology | Version | Purpose | Why This Choice |
|---|---|---|---|
| **Node.js** | 20+ | Runtime | Non-blocking I/O ideal for media-heavy API; massive ecosystem |
| **Express** | 5.x | HTTP Framework | Industry standard, minimal overhead, excellent middleware ecosystem |
| **MongoDB** | Latest | Database | Document model maps naturally to video/user data; flexible schema for evolving features |
| **Mongoose** | 9.x | ODM | Schema validation, middleware hooks (pre-save password hashing), population, aggregation pipelines |
| **mongoose-aggregate-paginate-v2** | 1.x | Pagination | Efficient server-side pagination for videos, comments, and tweets |
| **bcrypt** | 6.x | Password Hashing | Industry-standard adaptive hashing; resistant to brute-force attacks |
| **jsonwebtoken** | 9.x | Authentication | Stateless auth via dual-token (access + refresh) JWT strategy |
| **Cloudinary** | 2.x | Media Storage | Managed CDN for video/image hosting; on-the-fly transformations; no self-hosted storage needed |
| **Multer** | 2.x | File Upload | Multipart form parsing; temp file storage before Cloudinary upload |
| **@google/genai** | 2.x | AI Features | Gemini API for auto-generating captions (WebVTT), video summaries, and metadata |
| **cookie-parser** | 1.x | Cookie Handling | Parse HTTP-only cookies for JWT token extraction |
| **cors** | 2.x | CORS | Configurable origin whitelist with localhost auto-allow for development |
| **dotenv** | 17.x | Config | Environment variable management for secrets and configuration |
| **nodemon** | 3.x | Dev Tooling | Auto-restart server on file changes during development |

### Frontend Stack

| Technology | Version | Purpose | Why This Choice |
|---|---|---|---|
| **React** | 19.x | UI Framework | Component-based architecture; latest features (Suspense, lazy loading) |
| **Vite** | 8.x | Build Tool | Instant HMR, fast cold starts, native ESM — drastically faster than Webpack |
| **React Router DOM** | 7.x | Routing | Declarative routing with nested layouts, protected routes, lazy loading |
| **Redux Toolkit** | 2.x | Client State | Auth state, UI preferences; predictable state container with minimal boilerplate |
| **TanStack React Query** | 5.x | Server State | Automatic caching, background refetch, pagination, optimistic updates for API data |
| **Axios** | 1.x | HTTP Client | Interceptor-based auto-refresh on 401; cleaner API than fetch for complex flows |
| **React Hook Form** | 7.x | Form Management | Performant (uncontrolled inputs); minimal re-renders; clean validation API |
| **Zod** | 4.x | Schema Validation | Type-safe validation schemas; pairs with `@hookform/resolvers` for form validation |
| **TailwindCSS** | 4.x | Styling | Utility-first CSS; rapid prototyping with consistent design tokens |
| **tailwind-merge** | 3.x | Class Utilities | Resolves conflicting Tailwind classes in component composition |
| **clsx** | 2.x | Class Utilities | Conditional class name construction for dynamic styling |
| **Lucide React** | 1.x | Icons | Tree-shakeable, consistent icon set; lightweight alternative to icon fonts |
| **oxlint** | 1.x | Linting | Blazing-fast Rust-based linter; faster alternative to ESLint |

### Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Monorepo vs Polyrepo** | Monorepo (`/backend` + `/frontend`) | Simpler development workflow; shared `.git` history; co-located documentation |
| **REST vs GraphQL** | REST | Simpler to implement; sufficient for CRUD-heavy video platform; better caching semantics |
| **Auth Strategy** | JWT (dual-token, cookies) | Stateless backend; HTTP-only cookies prevent XSS token theft; refresh token enables long sessions |
| **State Split** | Redux (client) + React Query (server) | Clear separation: Redux owns auth/UI state, React Query owns API cache with auto-invalidation |
| **File Storage** | Cloudinary (not self-hosted) | Zero infrastructure for media CDN; built-in video processing; scalable without DevOps overhead |
| **AI Integration** | Google Gemini API | Powerful multimodal capabilities for video understanding; generates captions + summaries from video content |
| **API Versioning** | URL-based (`/api/v1/`) | Simple, explicit versioning; easy to run v1 and v2 simultaneously during migration |
| **Error Handling** | Centralized `ApiError` + global handler | Consistent error response format; single point of error logging; only 500s logged to console |
| **Code Splitting** | React.lazy + Suspense | Reduces initial bundle size; pages load on demand with animated loading state |
| **Form Validation** | Dual-layer (Zod frontend + Mongoose backend) | Client-side for UX; server-side for security — never trust the client |
| **Pagination** | Aggregate pipeline + paginate plugin | Efficient for large datasets; supports complex lookups (join owner, count likes) in single query |

---

> **📌 Note:** This documentation reflects the current state of the codebase. Update this file as the architecture evolves.
