import type { Request } from "express";
import { WinstonLogger } from "./winstonLogger.js";
import type { ILogger } from "@application/interface/logger/Ilogger.js";

export class RequestLogger implements ILogger {
  private baseLogger: WinstonLogger;
  private correlationId?: string;

  constructor(req?: Request) {
    this.baseLogger = new WinstonLogger();
    this.correlationId = req?.correlationId;
  }

  private withContext(meta: Record<string, unknown> = {}) {
    return {
      correlationId: this.correlationId,
      ...meta,
    };
  }

  info(message: string, meta: Record<string, unknown> = {}) {
    this.baseLogger.info(message, this.withContext(meta));
  }

  warn(message: string, meta: Record<string, unknown> = {}) {
    this.baseLogger.warn(message, this.withContext(meta));
  }

  error(message: string, meta: Record<string, unknown> = {}) {
    this.baseLogger.error(message, this.withContext(meta));
  }

  debug(message: string, meta: Record<string, unknown> = {}) {
    this.baseLogger.debug(message, this.withContext(meta));
  }
}
