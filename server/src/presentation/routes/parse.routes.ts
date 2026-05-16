import type { OcrController } from "@presentation/controller/OcrController.js";
import { uploadAadhaar } from "@presentation/middlewares/upload.js";
import { Router } from "express";

export class ParseRouter {
  private _router: Router;

  constructor(private _OcrController: OcrController) {
    this._router = Router();
  }

  register(): Router {
    /**
     * POST /parse
     *
     * Expects multipart/form-data with two fields:
     *   front — front side of the Aadhaar card (JPEG / PNG / WEBP)
     *   back  — back side of the Aadhaar card
     *
     * Responses:
     *   200 — OCR succeeded (confidence may still be low)
     *   400 — missing files or obviously bad input
  
     */
    this._router.post("/parse", uploadAadhaar, this._OcrController.parseAadhaar);
    return this._router;
  }
}
