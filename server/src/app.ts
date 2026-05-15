import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { RequestLogger } from "@infrastructure/logger/requestLogger.js";
import { errorHandler } from "@presentation/middlewares/error.middleware.js";

const app = express();

app.use(cors());

app.use(helmet());

app.use(express.json());

app.use(morgan("dev"));

app.use(errorHandler(new RequestLogger()));

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server running",
  });
});

export default app;
