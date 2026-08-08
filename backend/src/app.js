import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app=express()

// Support multiple CORS origins (comma-separated in .env)
// e.g. CORS_ORIGIN=http://localhost:5173,https://yourapp.com
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (curl, Postman, server-to-server)
        if (!origin) return callback(null, true)

        // Always allow localhost in any port (development)
        if (origin.match(/^https?:\/\/localhost(:\d+)?$/)) {
            return callback(null, true)
        }

        // Allow specific Vercel project deployments (secure)
        if (origin.match(/^https:\/\/voxora-where-video-meets-tweets.*\.vercel\.app$/)) {
            return callback(null, true)
        }

        // Allow origins listed in .env
        if (allowedOrigins.includes(origin)) {
            return callback(null, true)
        }

        return callback(new Error(`CORS: Origin ${origin} not allowed`), false)
    },
    credentials: true
}))

app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))
app.use(express.static("public"))
app.use(cookieParser())


 


// routes import 
import userRouter from './routes/user.routes.js'
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

// routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)

// Global error handler
import { ApiError } from "./utils/ApiError.js"

app.use((err, req, res, next) => {
    let error = err;
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode ? error.statusCode : 500;
        const message = error.message || "Something went wrong";
        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }
    
    // Only log 500 errors to the console, don't spam stack traces for expected 401s/404s
    if (error.statusCode >= 500) {
        console.error(error);
    }

    return res.status(error.statusCode).json({
        success: error.success,
        message: error.message,
        errors: error.errors,
        // Include stack trace only if you want it in dev, otherwise comment out:
        // stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    })
})

export {app};