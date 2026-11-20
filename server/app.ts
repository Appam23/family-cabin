import "dotenv/config";
import cors from "cors";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import { connectToDatabase } from "./db.js";
import { authRouter } from "./routes/auth.routes.js";
import { projectRouter } from "./routes/project.routes.js";
import { announcementRouter } from "./routes/announcement.routes.js";
import { userRouter } from "./routes/user.routes.js";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const allowedOrigins = new Set(
  [
    process.env.FRONTEND_URL,
    "https://family-cabin-1.onrender.com",
    "http://localhost:4321"
  ].filter((origin): origin is string => Boolean(origin))
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET ?? "test-only-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7
    },
    ...(process.env.NODE_ENV === "test"
      ? {}
      : { store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }) })
  })
);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/announcements", announcementRouter);
app.use("/api/v1/users", userRouter);

app.get("/api/v1/health", (_request, response) => {
  response.json({ status: "ok" });
});

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT ?? 3000);

  connectToDatabase()
    .then(() => {
      app.listen(port, () => {
        console.log(`API server listening on port ${port}`);
      });
    })
    .catch((error: unknown) => {
      console.error("Unable to start API server", error);
      process.exitCode = 1;
    });
}
