import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import savedJobRoute from "./routes/savedJob.route.js";
import notificationRoute from "./routes/notification.route.js";
import copilotRoute from "./routes/copilot.route.js";
import { getAllowedOrigins } from "./utils/origins.js";

dotenv.config({ path: new URL(".env", import.meta.url) });

const requiredEnv = ["MONGO_URI", "SECRET_KEY", "CLOUD_NAME", "API_KEY", "API_SECRET"];
const missingEnv = requiredEnv.filter((name) => !process.env[name]);

if (missingEnv.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnv.join(", ")}`);
}

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(helmet());
app.use(express.json({ limit:"1mb" }));
app.use(express.urlencoded({ extended:true, limit:"1mb", parameterLimit:100 }));
app.use(cookieParser());

const allowedOrigins = getAllowedOrigins({
    frontendUrls:process.env.FRONTEND_URLS,
    isProduction:process.env.NODE_ENV === "production"
});

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }
        const error = new Error("Origin is not allowed by CORS.");
        error.status = 403;
        return callback(error);
    },
    credentials: true
}));

const PORT = process.env.PORT || 8000;

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/saved-jobs", savedJobRoute);
app.use("/api/v1/notifications", notificationRoute);
app.use("/api/v1/copilot", copilotRoute);

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = Number.isInteger(error.status) ? error.status : 500;
    if (status >= 500) console.error("Unhandled API error:", error);
    return res.status(status).json({
        message:status === 403 ? error.message : "The request could not be completed.",
        success:false
    });
});

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running at port ${PORT}`);
    });
};

startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exitCode = 1;
});