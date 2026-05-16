import type { AadhaarCard } from "@domain/entities/AadhaarCard.js";

function extractAadhaarNumber(text: string): string {
  // Aadhaar is exactly 12 digits, printed as "XXXX XXXX XXXX" on the card
  const matches = [...text.matchAll(/\b(\d{4})\s(\d{4})\s(\d{4})\b/g)];
  if (matches.length === 0) {
    // Fallback: any 12-digit run (OCR may drop spaces)
    const fallback = text.match(/\b(\d{12})\b/);
    return fallback ? fallback[1] : "";
  }
  // The back of the card repeats the number; de-duplicate and take the first
  const number = (matches[0][1] + matches[0][2] + matches[0][3]).replace(/\s/g, "");
  return number;
}

function extractName(text: string): string {
  // Strategy: the name on Aadhaar front always appears immediately BEFORE
  // the DOB line. We find the DOB line index and take the line above it.
  const lines = text
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (let i = 1; i < lines.length; i++) {
    if (/\b\d{2}[\/\-]\d{2}[\/\-]\d{4}\b/.test(lines[i])) {
      // Walk backward past any Hindi-only lines
      for (let j = i - 1; j >= 0; j--) {
        const candidate = lines[j].replace(/[^A-Za-z\s.]/g, "").trim();
        if (candidate.length >= 3 && /[A-Za-z]/.test(candidate)) {
          return candidate;
        }
      }
    }
  }

  // Secondary strategy: line matching "D/O" or "S/O" / "W/O" — name precedes it
  const relationMatch = text.match(/([A-Za-z][A-Za-z\s.]{3,44})\s+(?:D\/O|S\/O|W\/O)/i);
  if (relationMatch) return relationMatch[1].trim();

  // Tertiary: first long all-alpha line that isn't a known header
  const IGNORED = /government|india|unique|authority|aadhaar|address|mobile|dob|vid|female|male/i;
  const fallback = lines.find((l) => /^[A-Za-z\s.]{4,50}$/.test(l) && !IGNORED.test(l));
  return fallback ?? "";
}

function extractDob(text: string): string {
  // Handles DD/MM/YYYY and DD-MM-YYYY (OCR sometimes produces hyphens)
  const match = text.match(/\b(\d{2})[\/\-](\d{2})[\/\-](\d{4})\b/);
  if (!match) return "";
  // Normalise to DD/MM/YYYY
  return `${match[1]}/${match[2]}/${match[3]}`;
}

function extractGender(text: string): string {
  const match = text.match(/\b(Male|Female|MALE|FEMALE|पुरुष|महिला)\b/i);
  if (!match) return "";
  const raw = match[1].toLowerCase();
  if (raw === "male" || raw === "पुरुष") return "MALE";
  if (raw === "female" || raw === "महिला") return "FEMALE";
  return match[1].toUpperCase();
}

function extractMobile(text: string): string {
  // The card prints "Mobile No. XXXXXXXXXX" on the front
  const explicit = text.match(/Mobile\s*No\.?\s*[:\.]?\s*(\d{10})/i);
  if (explicit) return explicit[1];
  // Fallback: standalone 10-digit number starting with 6-9 (Indian mobile range)
  const standalone = text.match(/\b([6-9]\d{9})\b/);
  return standalone ? standalone[1] : "";
}

function extractVid(text: string): string {
  // VID is 16 digits printed as "VID : XXXX XXXX XXXX XXXX"
  const match = text.match(/VID\s*[:\.]?\s*([\d\s]{19,24})/i);
  if (!match) return "";
  const digits = match[1].replace(/\s/g, "");
  // Sanity check: VID is always exactly 16 digits
  return digits.length === 16 ? digits : digits.slice(0, 16);
}

function extractAddress(text: string): string {
  // The back of the card has "Address" (English) and/or "पता" (Hindi).
  // We want only the English address block.
  let start = text.search(/\bAddress\b/i);
  if (start === -1) start = text.search(/पता/);
  if (start === -1) return "";

  const chunk = text.slice(start, start + 600);

  const cleaned = chunk
    .replace(/^Address[:\s]*/i, "")
    .replace(/^पता[:\s]*/i, "")
    // Strip the repeated Aadhaar number that appears at the end
    .replace(/\b\d{4}\s?\d{4}\s?\d{4}\b[\s\S]*/g, "")
    // Strip UIDAI footer lines
    .replace(/(?:help@uidai\.gov\.in|www\.uidai\.gov\.in|1947)[\s\S]*/gi, "")
    // Strip OCR noise lines (short fragments, lines that are pure symbols)
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 4 && /[A-Za-z0-9]/.test(l))
    .join(", ")
    .replace(/\s{2,}/g, " ")
    .trim();

  return cleaned;
}

export function extractAll(frontText: string, backText: string, confidence: number): AadhaarCard {
  const combined = frontText + "\n" + backText;

  return {
    aadhaarNumber: extractAadhaarNumber(combined),
    name: extractName(frontText),
    dob: extractDob(frontText),
    gender: extractGender(frontText),
    mobile: extractMobile(frontText),
    vid: extractVid(frontText),
    address: extractAddress(backText),
    confidence,
  };
}
