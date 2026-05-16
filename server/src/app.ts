import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { RequestLogger } from "@infrastructure/logger/requestLogger.js";
import { errorHandler } from "@presentation/middlewares/error.middleware.js";
import { env } from "@core/config/env.js";
import { correlationIdMiddleware } from "@presentation/middlewares/correlationId.middleware.js";
import { parseRouter } from "@Di/parse.di.js";
import compression from "compression";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // limit each IP

  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

const app = express();

const logger = new RequestLogger();

app.use(compression());

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(correlationIdMiddleware);

app.use("/api/ocr", parseRouter.register());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server running",
  });
});

app.use(errorHandler(new RequestLogger()));

logger.info("Server initializing...", { env: env.NODE_ENV });

export default app;
