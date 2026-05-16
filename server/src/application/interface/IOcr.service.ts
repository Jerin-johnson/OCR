import { type AadhaarCard } from "@domain/entities/AadhaarCard.js";

export interface IOcrService {
  processAadhaar(frontImagePath: Buffer, backImagePath: Buffer): Promise<AadhaarCard>;
}
