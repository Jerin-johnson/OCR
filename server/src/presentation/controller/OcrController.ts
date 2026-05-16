import { ResponseBuilder } from "@application/common/apiResponse.js";
import type { IProcessAadhaarUseCase } from "@application/interface/IProcessAadhaar.usecase.js";
import type { ILogger } from "@application/interface/logger/Ilogger.js";
import { BadRequestError } from "@domain/exceptions/index.js";
// import type{ AppError } from "@domain/exceptions/appError.js";
import type { Request, Response } from "express";

export class OcrController {
  constructor(
    private _Logger: ILogger,
    private _ProcessAadhaarUseCase: IProcessAadhaarUseCase,
  ) {}

  parseAadhaar = async (req: Request, res: Response): Promise<void> => {
    const correlationId = req.correlationId;

    const files = req.files as {
      front?: Express.Multer.File[];
      back?: Express.Multer.File[];
    };

    if (!files?.front?.[0] || !files?.back?.[0]) {
      throw new BadRequestError("Both front and back Aadhaar card images are required");
    }

    const frontPath = files.front[0].path;
    const backPath = files.back[0].path;

    console.warn("the path", frontPath, backPath);

    this._Logger.info("Aadhaar OCR request received", { correlationId });

    const result = await this._ProcessAadhaarUseCase.execute(frontPath, backPath, correlationId);

    // Cleanup files after successful processing
    this.cleanupFiles([frontPath, backPath]).catch((err) => {
      this._Logger.warn("Failed to delete temporary files", { error: err.message });
    });

    res
      .status(200)
      .json(ResponseBuilder.success(result, "Aadhaar card processed successfully", correlationId));
  };

  private async cleanupFiles(paths: string[]): Promise<void> {
    const fs = await import("fs/promises");
    for (const filePath of paths) {
      try {
        await fs.unlink(filePath);
      } catch (err: unknown) {
        // if (err.code !== "ENOENT") throw err; // Ignore if file doesn't exist
        console.warn(err);
      }
    }
  }
}
