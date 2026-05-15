import type { OcrController } from "@presentation/controller/OcrController.js";
import { uploadAadhaar } from "@presentation/middlewares/upload.js";
import { Router } from "express";

export class ParseRouter {
  private _router: Router;

  constructor(private _OcrController: OcrController) {
    this._router = Router();
  }

  register(): Router {
    this._router.post("/parse", uploadAadhaar, this._OcrController.parseAadhaar);
    return this._router;
  }
}
