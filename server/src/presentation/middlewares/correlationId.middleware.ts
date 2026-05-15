import type { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Get correlation ID from header if provided by client (good practice)
  const correlationId = uuidv4(); // Generate new unique ID

  // Attach to request object so we can use it anywhere
  req.correlationId = correlationId;

  // Also send it back in response headers (very useful for frontend debugging)
  res.setHeader("x-correlation-id", correlationId);

  next();
};
