// Generic interface for all API responses
export interface ApiResponse<T = unknown> {
  // Changed 'any' to 'unknown' (safer)
  success: boolean; // true = success, false = failed
  message: string; // Human readable message
  data?: T; // Actual data (only on success)
  error?: string; // Error name/type (only on failure)
  errors?: Record<string, string[]>; // Field validation errors
  timestamp: string; // When this response was created
  correlationId?: string; // For tracking requests
}

// Helper class to easily create responses
export class ResponseBuilder {
  static success<T>(
    data: T,
    message = "Operation successful",
    correlationId?: string,
  ): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      correlationId,
    };
  }

  // Use this when there is an error
  static error(
    message: string,
    error?: string,
    errors?: Record<string, string[]>,
    correlationId?: string,
  ): ApiResponse<null> {
    return {
      success: false,
      message,
      error,
      errors,
      timestamp: new Date().toISOString(),
      correlationId,
    };
  }
}
