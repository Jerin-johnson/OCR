import type { AadhaarCard } from "@domain/entities/AadhaarCard.js";

export interface IProcessAadhaarUseCase {
  execute(frontPath: string, backPath: string, correlationId?: string): Promise<AadhaarCard>;
}
