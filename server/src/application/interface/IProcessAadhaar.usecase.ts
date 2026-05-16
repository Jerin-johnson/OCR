import type { AadhaarCard } from "@domain/entities/AadhaarCard.js";

export interface IProcessAadhaarUseCase {
  execute(frontPath: Buffer, backPath: Buffer, correlationId?: string): Promise<AadhaarCard>;
}
