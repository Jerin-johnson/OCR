// import sharp from "sharp";
import type { IOcrService } from "@application/interface/IOcr.service.js";
// import { getOCRWorker } from "./workers/ocr.worker.js";
// import { ocrQueue } from "./queue/ocr.queue.js";
import type { ILogger } from "@application/interface/logger/Ilogger.js";
import { extractAll } from "./helpers/utlis.js";
import Tesseract from "tesseract.js";

// sharp.cache(false);
// sharp.concurrency(1);

export class OCRService implements IOcrService {
  constructor(private _logger: ILogger) {}

  async processAadhaar(frontBuffer: Buffer, backBuffer: Buffer) {
    this._logger.info("is this is working");
    // return ocrQueue.add(async () => {
    // const worker = await getOCRWorker();

    // const [optimizedFront, optimizedBack] = await Promise.all([
    //   preprocess(frontBuffer),
    //   preprocess(backBuffer),
    // ]);

    const [frontOCR, backOCR] = await Promise.all([
      Tesseract.recognize(frontBuffer),
      Tesseract.recognize(backBuffer),
    ]);

    return extractAll(
      frontOCR.data.text,
      backOCR.data.text,
      Math.min(frontOCR.data.confidence, backOCR.data.confidence),
    );
    // });
  }
}

// async function preprocess(imagePath: Buffer) {
//   return sharp(imagePath)
//     .grayscale()
//     .resize(1400, null, { fit: "inside" }) // Higher resolution for better accuracy
//     .normalize() // Improve contrast
//     .sharpen({ sigma: 1.2 }) // Reduce blur
//     .toBuffer();
// }

export function extractAadhaarData(frontText: string, backText: string, confidence: number) {
  const result = {
    aadhaarNumber: "",
    name: "",
    dob: "",
    gender: "",
    address: "",
    mobile: "",
    vid: "",
    confidence,
  };

  // Aadhaar
  const aadhaar = frontText.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);

  if (aadhaar) {
    result.aadhaarNumber = aadhaar[0].replace(/\s/g, "");
  }

  // DOB
  const dob = frontText.match(/\b\d{2}\/\d{2}\/\d{4}\b/);

  if (dob) {
    result.dob = dob[0];
  }

  // Gender
  const gender = frontText.match(/\b(MALE|FEMALE)\b/i);

  if (gender) {
    result.gender = gender[0].toUpperCase();
  }

  // Mobile
  const mobile = frontText.match(/\b\d{10}\b/);

  if (mobile) {
    result.mobile = mobile[0];
  }

  // VID
  const vid = frontText.match(/VID[: ]+([\d ]+)/i);

  if (vid) {
    result.vid = vid[1].replace(/\s/g, "");
  }

  // Name
  result.name = extractName(frontText);

  // Address
  result.address = extractAddress(backText);

  return result;
}

function extractName(text: string) {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const ignored = ["government", "india", "dob", "male", "female", "aadhaar", "vid", "mobile"];

  for (const line of lines) {
    if (
      /^[A-Za-z ]{3,40}$/.test(line) &&
      !ignored.some((word) => line.toLowerCase().includes(word))
    ) {
      return line;
    }
  }

  return "";
}

function extractAddress(text: string) {
  const start = text.search(/Address/i);

  if (start === -1) {
    return "";
  }

  return text
    .substring(start)
    .replace(/Address[: ]*/i, "")
    .replace(/\s+/g, " ")
    .replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, "")
    .replace(/help@uidai\.gov\.in.*/is, "")
    .trim();
}
