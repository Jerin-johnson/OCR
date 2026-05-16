import { ProcessAadhaarUseCase } from "@application/usecase/ProcessAadhaar.usecase.js";
import { RequestLogger } from "@infrastructure/logger/requestLogger.js";
import { WorkerOcrService } from "@infrastructure/services/ocr/WorkerOcrService.js";
import { OcrController } from "@presentation/controller/OcrController.js";
import { ParseRouter } from "@presentation/routes/parse.routes.js";

const loggerService = new RequestLogger();
const ocrService = new WorkerOcrService(loggerService);
const processAadhaarUseCase = new ProcessAadhaarUseCase(ocrService, loggerService);
const ocrController = new OcrController(loggerService, processAadhaarUseCase);

export const parseRouter = new ParseRouter(ocrController);
