# 🎬 Voxora — Where Video Meets Tweets

Voxora is a full-stack video-sharing and social media platform inspired by YouTube and Twitter. Users can upload videos, write tweets, comment, like, create playlists, subscribe to channels, and leverage **AI-powered features** like tweet polishing, video summary generation, comment sentiment analysis, and auto-tweet announcements — all powered by Google's Gemini AI.

---

## ✨ Features

### 🎥 Video Platform
- **Upload & Manage Videos** — Upload videos with thumbnails, set publish/unpublish status.
- **Watch Page** — Stream videos with a full video player, like/dislike, and view count tracking.
- **Search & Discovery** — Search videos by title, browse the home feed, and filter results.
- **Video Descriptions** — Expandable descriptions with "show more / show less" toggle.

### 🐦 Twitter-Style Tweets
- **Post Tweets** — Create text and image-based tweets.
- **Threaded Replies** — Reply to tweets in nested threads.
- **Like & Interact** — Like tweets, comments, and videos.

### 🤖 AI-Powered Features (Gemini)
- **TL;DW AI Summary** — Generates a concise summary of a video's content from its title and description.
- **Auto-Fill Video Metadata** — When uploading a video, AI can automatically suggest a title and description based on the video file.
- **Comment Sentiment Analysis** — Analyzes the overall sentiment of a video's comments and provides a human-readable insight.
- **Polish My Tweet** — An in-composer AI button that rewrites your draft tweet in different tones: Fix Grammar, Professional, Funny, or Hype.
- **Auto-Tweet Video Announcements** — Generates 3 distinct tweet styles (Hype, Informative, Question) to promote your newly uploaded video, postable in one click.

### 👤 User & Channel
- **Authentication** — Register, login, logout with secure JWT access & refresh tokens stored in HTTP-only cookies.
- **Channel Pages** — View any user's channel with their videos, tweets, and subscriber count.
- **Subscriptions** — Subscribe/unsubscribe to channels, view your subscription feed.
- **User Settings** — Update avatar, cover image, email, full name, and password.

### 📚 Library & Playlists
- **Playlists** — Create, edit, delete playlists. Add or remove videos.
- **Library Page** — View your watch history and saved playlists.

### 📊 Creator Dashboard
- **Channel Stats** — Total subscribers, videos, views, and likes at a glance.
- **Video Management** — Toggle publish status, delete videos, save to playlists, and announce videos via AI-generated tweets.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite** | Build tool & dev server |
| **TailwindCSS 4** | Utility-first styling |
| **React Router v7** | Client-side routing |
| **TanStack React Query** | Server state management, caching & pagination |
| **Redux Toolkit** | Global auth state management |
| **React Hook Form + Zod** | Form handling & validation |
| **Axios** | HTTP client with interceptors for token refresh |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | REST API server |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT (jsonwebtoken)** | Access & refresh token authentication |
| **bcrypt** | Password hashing |
| **Multer** | File upload handling (disk storage) |
| **Cloudinary** | Cloud storage for videos, thumbnails & avatars |
| **Google Gemini AI** | AI features (summaries, polishing, sentiment, announcements) |
| **cookie-parser** | Secure HTTP-only cookie management |

---

## 📁 Project Structure

```
YOUTUBE_PROJECT/
├── backend/
│   ├── public/temp/             # Temporary file uploads (multer)
│   └── src/
│       ├── controllers/         # Business logic (user, video, tweet, comment, like, playlist, dashboard)
│       ├── db/                  # MongoDB connection
│       ├── middlewares/         # Auth (JWT verification) & Multer file handling
│       ├── models/              # Mongoose schemas (User, Video, Tweet, Comment, Like, Playlist, Subscription)
│       ├── routes/              # Express route definitions
│       ├── utils/               # ApiError, ApiResponse, asyncHandler, Cloudinary, Gemini AI
│       ├── app.js               # Express app configuration, CORS, middleware & route mounting
│       └── index.js             # Server entry point & DB connection
│
├── frontend/
│   └── src/
│       ├── api/                 # Axios instance & API wrappers (auth, video, tweet, comment, etc.)
│       ├── components/          # Reusable UI components organized by feature
│       │   ├── auth/            # AuthBootstrap, ProtectedRoute
│       │   ├── comment/         # CommentSection, CommentCard, CommentInput
│       │   ├── dashboard/       # VideoUploadModal, AutoTweetModal
│       │   ├── layout/          # AppShell, Navbar, Sidebar
│       │   ├── playlist/        # PlaylistModal, PlaylistCard
│       │   ├── shared/          # Avatar, ConfirmDialog, EmptyState, ErrorState, Toast, etc.
│       │   ├── tweet/           # TweetComposer, TweetCard
│       │   └── video/           # VideoPlayer, VideoDescription, VideoCard
│       ├── hooks/               # Custom React Query hooks (useAuth, useVideos, useTweets, etc.)
│       ├── lib/                 # Utility functions (formatCount, timeAgo, etc.)
│       ├── pages/               # Route-level page components
│       └── store/               # Redux store & auth slice
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or later)
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Cloudinary** account ([cloudinary.com](https://cloudinary.com/))
- **Google Gemini API Key** ([ai.google.dev](https://ai.google.dev/))

### 1. Clone the Repository
```bash
git clone https://github.com/RakshitKaintura/YouTube_Project.git
cd YouTube_Project
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=your-access-token-secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

GEMINI_API_KEY=your-gemini-api-key
```

Start the backend:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

Start the frontend:
```bash
npm run dev
```

The app will be running at `http://localhost:5173` 🎉

---

## 🌐 Deployment

| Service | Platform |
|---|---|
| **Database** | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free M0 cluster) |
| **Backend** | [Render](https://render.com/) (Web Service) |
| **Frontend** | [Vercel](https://vercel.com/) (Vite preset) |

> **Note:** The backend uses `multer.diskStorage` for temporary file uploads before sending them to Cloudinary. This requires a writable filesystem, which is why Render (not Vercel) is recommended for the backend.

---

## 📡 API Endpoints

### Auth & Users
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/users/register` | Register new user |
| POST | `/api/v1/users/login` | Login |
| POST | `/api/v1/users/logout` | Logout |
| POST | `/api/v1/users/refresh-token` | Refresh access token |
| GET | `/api/v1/users/current-user` | Get current user |
| PATCH | `/api/v1/users/update-account` | Update account details |
| PATCH | `/api/v1/users/avatar` | Update avatar |
| PATCH | `/api/v1/users/cover-image` | Update cover image |
| GET | `/api/v1/users/c/:username` | Get channel profile |

### Videos
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/videos` | Get all videos (paginated) |
| POST | `/api/v1/videos` | Upload a video |
| GET | `/api/v1/videos/:videoId` | Get video by ID |
| PATCH | `/api/v1/videos/:videoId` | Update video |
| DELETE | `/api/v1/videos/:videoId` | Delete video |
| PATCH | `/api/v1/videos/toggle/publish/:videoId` | Toggle publish status |
| GET | `/api/v1/videos/:videoId/summary` | Get AI video summary |
| POST | `/api/v1/videos/generate-metadata` | AI auto-fill title & description |

### Tweets
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/tweets` | Get all tweets |
| POST | `/api/v1/tweets` | Create tweet |
| PATCH | `/api/v1/tweets/:tweetId` | Update tweet |
| DELETE | `/api/v1/tweets/:tweetId` | Delete tweet |
| POST | `/api/v1/tweets/polish` | AI polish tweet |
| GET | `/api/v1/tweets/generate-announcements/:videoId` | AI generate announcement tweets |

### Comments, Likes, Subscriptions, Playlists
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/comments/:videoId` | Get video comments |
| POST | `/api/v1/comments/:videoId` | Add comment |
| POST | `/api/v1/likes/toggle/v/:videoId` | Toggle video like |
| POST | `/api/v1/likes/toggle/t/:tweetId` | Toggle tweet like |
| POST | `/api/v1/subscriptions/c/:channelId` | Toggle subscription |
| POST | `/api/v1/playlist` | Create playlist |
| PATCH | `/api/v1/playlist/add/:videoId/:playlistId` | Add video to playlist |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/dashboard/stats` | Get channel stats |
| GET | `/api/v1/dashboard/videos` | Get dashboard videos |

---

## 👨‍💻 Author

**Rakshit Kaintura**
- GitHub: [@RakshitKaintura](https://github.com/RakshitKaintura)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
