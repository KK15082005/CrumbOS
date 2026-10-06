import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { ApiError } from "./utils/ApiError";
import { config } from "./config/env";

const app: Application = express();

// Global Middlewares
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base Route
app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "CrumbOS Backend API",
    version: "1.0.0",
    docs: "/api/v1/health",
  });
});

// API Routes
app.use("/api/v1", routes);

// Handle 404 for undefined routes
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(404, `Cannot ${req.method} ${req.originalUrl} - Route not found`));
});

// Global Error Handler
app.use(errorHandler);

export default app;
