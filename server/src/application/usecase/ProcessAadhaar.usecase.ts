import type { IOcrService } from "@application/interface/IOcr.service.js";
import type { IProcessAadhaarUseCase } from "@application/interface/IProcessAadhaar.usecase.js";
import type { ILogger } from "@application/interface/logger/Ilogger.js";
import type { AadhaarCard } from "@domain/entities/AadhaarCard.js";
import { BadRequestError } from "@domain/exceptions/index.js";

export class ProcessAadhaarUseCase implements IProcessAadhaarUseCase {
  constructor(
    private readonly ocrService: IOcrService,
    private readonly logger: ILogger,
  ) {}

  async execute(frontPath: Buffer, backPath: Buffer, correlationId?: string): Promise<AadhaarCard> {
    this.logger.info("Starting Aadhaar OCR processing", { correlationId });

    if (!frontPath || !backPath) {
      throw new BadRequestError("Image paths are required");
    }

    try {
      // this.log("the usecase is working");
      const result = await this.ocrService.processAadhaar(frontPath, backPath);

      this.logger.info("Aadhaar OCR completed successfully", {
        correlationId,
        hasAadhaarNumber: !!result.aadhaarNumber,
      });

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("OCR processing failed", { correlationId, error: message });
      throw error;
    }
  }
}
