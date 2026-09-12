import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";

dotenv.config({ path: new URL(".env", import.meta.url) });

const requiredEnv = ["MONGO_URI", "SECRET_KEY", "CLOUD_NAME", "API_KEY", "API_SECRET"];
const missingEnv = requiredEnv.filter((name) => !process.env[name]);

if (missingEnv.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnv.join(", ")}`);
}

const app = express();
app.set("trust proxy", 1);

// middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
const corsOptions = {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials:true
}

app.use(cors(corsOptions));

const PORT = process.env.PORT || 8000;

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});


// api's
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);



const startServer = async () => {
    await connectDB();
    const server = app.listen(PORT, () => {
        console.log(`Server running at port ${PORT}`);
    });
    server.on("error", (error) => {
        if (error.code === "EADDRINUSE") {
            console.error(`Port ${PORT} is already in use. Stop the existing backend before starting another one.`);
            process.exitCode = 1;
            return;
        }
        throw error;
    });
};

startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exitCode = 1;
});