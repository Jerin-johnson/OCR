import { parentPort, workerData } from "worker_threads";
import sharp from "sharp";
import Tesseract from "tesseract.js";

sharp.cache(false);
sharp.concurrency(1);

async function main() {
  const { frontImagePath, backImagePath } = workerData;

  try {
    // Enhanced preprocessing with multiple variants
    // const [frontBuffer, backBuffer] = await Promise.all([
    //   preprocessImage(frontImagePath),
    //   preprocessImage(backImagePath),
    // ]);

    const frontBuffer = await preprocessImage(frontImagePath);

    const backBuffer = await preprocessImage(backImagePath);

    // const [front, back] = await Promise.all([
    //   Tesseract.recognize(frontBuffer, "eng+hin"),
    //   Tesseract.recognize(backBuffer, "eng+hin"),
    // ]);

    const front = await Tesseract.recognize(frontBuffer, "eng+hin");

    const back = await Tesseract.recognize(backBuffer, "eng+hin");

    const fullText = (front.data.text + "\n" + back.data.text).trim();

    const result = extractAadhaarData(fullText);

    result.confidence = Math.round((front.data.confidence + back.data.confidence) / 2);

    parentPort!.postMessage({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error in OCR worker";
    console.error("Worker error:", message);
    parentPort!.postMessage({ success: false, error: message });
  }
}

/**
 * Enhanced image preprocessing
 */
async function preprocessImage(imagePath: string) {
  return sharp(imagePath)
    .grayscale()
    .resize(1400, null, { fit: "inside" }) // Higher resolution for better accuracy
    .normalize() // Improve contrast
    .sharpen({ sigma: 1.2 }) // Reduce blur
    .toBuffer();
}

/**
 * Much more robust extraction logic
 */
function extractAadhaarData(fullText: string) {
  const lines = fullText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 3);

  const result = {
    aadhaarNumber: "",
    name: "",
    dob: "",
    gender: "",
    address: "",
    mobile: "",
    vid: "",
    // rawText: fullText.substring(0, 2200),
    confidence: 0,
  };

  // ====================== AADHAAR NUMBER ======================
  const aadhaarRegex = /\b(\d{4}\s?\d{4}\s?\d{4})\b/g;
  const aadhaarMatches = [...fullText.matchAll(aadhaarRegex)];
  if (aadhaarMatches.length > 0) {
    // Take the longest/most complete one
    result.aadhaarNumber = aadhaarMatches[0][1].replace(/\s/g, "");
  }

  // ====================== NAME ======================
  const namePatterns = [
    /Name[:\s]*([A-Za-z\s.]+?)(?=\s+(?:D\/O|S\/O|W\/O|DOB|Date|जन्म))/i,
    /(?:नाम|Name)[:\s]*([^\n]+)/i,
    /^([A-Z][A-Za-z\s.]{4,45})$/m,
    /([A-Za-z\s]{6,45})\s+(?:D\/O|S\/O|W\/O)/i,
  ];

  for (const regex of namePatterns) {
    const match = fullText.match(regex);
    if (match?.[1]) {
      const name = match[1].trim();
      if (name.length > 4 && !/\d{3,}/.test(name)) {
        result.name = name;
        break;
      }
    }
  }

  // Fallback name detection from lines
  if (!result.name) {
    const possibleName = lines.find(
      (line) =>
        /^[A-Za-z\s.]{5,50}$/.test(line) &&
        !/(GOVERNMENT|INDIA|UNIQUE|AUTHORITY|Address|DOB|Mobile)/i.test(line),
    );
    if (possibleName) result.name = possibleName;
  }

  // ====================== DOB ======================
  const dobMatch = fullText.match(/\b(\d{2}\/\d{2}\/\d{4})\b/);
  if (dobMatch) result.dob = dobMatch[1];

  // ====================== GENDER ======================
  const genderMatch = fullText.match(/\b(Male|Female|MALE|FEMALE|पुरुष|महिला)\b/i);
  if (genderMatch) {
    result.gender = genderMatch[1]
      .toUpperCase()
      .replace(/पुरुष/i, "MALE")
      .replace(/महिला/i, "FEMALE");
  }

  // ====================== ADDRESS ======================
  let addressStart = fullText.search(/Address/i);
  if (addressStart === -1) addressStart = fullText.search(/पता/i);

  if (addressStart !== -1) {
    const addressSection = fullText.substring(addressStart, addressStart + 700);
    result.address = addressSection
      .replace(/Address[:\s]*/i, "")
      .replace(/पता[:\s]*/i, "")
      .replace(/\d{4}\s?\d{4}\s?\d{4}.*$/s, "") // Remove Aadhaar number
      .replace(/AR 1947.*$/s, "")
      .replace(/help@uidai\.gov\.in.*$/s, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // ====================== MOBILE & VID ======================
  const mobileMatch = fullText.match(/Mobile No\.?\s*[:.]?\s*(\d{10})/i);
  if (mobileMatch) result.mobile = mobileMatch[1];

  const vidMatch = fullText.match(/VID\s*[:.]?\s*([\d\s]{19,})/i);
  if (vidMatch) result.vid = vidMatch[1].replace(/\s/g, "");

  return result;
}

main();
