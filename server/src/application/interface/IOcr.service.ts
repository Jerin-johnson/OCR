import { type AadhaarCard } from "@domain/entities/AadhaarCard.js";

export interface IOcrService {
  processAadhaar(frontImagePath: string, backImagePath: string): Promise<AadhaarCard>;
}
