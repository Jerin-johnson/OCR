export interface AadhaarCard {
  aadhaarNumber: string;
  name: string;
  dob: string;
  gender: string;
  mobile?: string;
  address?: string;
  fatherName?: string;
  pincode?: string;
  rawText?: string; // For debugging
  confidence?: number;
  source?: string;
  vid?: string;
}
