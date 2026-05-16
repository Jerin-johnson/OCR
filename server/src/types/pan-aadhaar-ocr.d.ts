declare module "pan-aadhaar-ocr" {
  export interface AadhaarDetails {
    aadhaarNumber?: string;
    name?: string;
    dob?: string;
    gender?: string;
    address?: string;
    rawText?: string;
  }

  export function extractAadhaarDetails(input: Buffer | string): Promise<AadhaarDetails>;
}
