import { ResponseBuilder } from "@application/common/apiResponse.js";
import { AppError } from "@domain/exceptions/appError.js";
import { ILogger } from "@application/interface/logger/logger.js";
import { ValidationError } from "@domain/exceptions/index.js";
import { Request, Response, NextFunction } from "express";

export const errorHandler = (logger: ILogger) => {
  return (err: any, req: Request, res: Response, next: NextFunction): void => {
    const correlationId = req.correlationId;

    // Log the error
    logger.error(err.message || "Unknown error", {
      correlationId,
      stack: err.stack,
      name: err.name,
      statusCode: err.statusCode,
    });

    // Operational (expected) errors
    if (err instanceof AppError) {
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

    // Unknown errors (500)
    res
      .status(500)
      .json(
        ResponseBuilder.error(
          "Something went wrong",
          process.env.NODE_ENV === "production" ? undefined : err.message,
          undefined,
          correlationId,
        ),
      );
  };
};
