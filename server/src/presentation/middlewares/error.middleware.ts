import { ResponseBuilder } from "@application/common/apiResponse.js";
import { AppError } from "@domain/exceptions/appError.js";
import type { ILogger } from "@application/interface/logger/Ilogger.js";
import { ValidationError } from "@domain/exceptions/index.js";
import type { Request, Response, NextFunction } from "express";

export const errorHandler = (logger: ILogger) => {
  return (err: unknown, req: Request, res: Response, next: NextFunction): void => {
    console.warn(next);
    const correlationId = req.correlationId;

    // Log the error

    // Operational (expected) errors
    if (err instanceof AppError) {
      logger.error(err.message || "Unknown error", {
        correlationId,
        stack: err.stack,
        name: err.name,
        statusCode: err.statusCode,
      });

      res
        .status(err.statusCode)
        .json(
          ResponseBuilder.error(
            err.message,
            err.name,
            err instanceof ValidationError ? err.errors : undefined,
            correlationId,
          ),
        );
      return;
    }

    const message = err instanceof Error ? err.message : "something went wrong";
    // Unknown errors (500)
    res
      .status(500)
      .json(
        ResponseBuilder.error(
          message,
          process.env.NODE_ENV === "production" ? undefined : message,
          undefined,
          correlationId,
        ),
      );
  };
};
