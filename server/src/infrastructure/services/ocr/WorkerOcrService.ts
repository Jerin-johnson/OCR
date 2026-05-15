import { Worker } from "worker_threads";
import type { IOcrService } from "@application/interface/IOcr.service.js";
import type { ILogger } from "@application/interface/logger/Ilogger.js";
import type { AadhaarCard } from "@domain/entities/AadhaarCard.js";

export class WorkerOcrService implements IOcrService {
  constructor(private readonly logger: ILogger) {}

  async processAadhaar(frontImagePath: string, backImagePath: string): Promise<AadhaarCard> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL("./workers/aadhaarOcrWorker.js", import.meta.url), {
        workerData: {
          frontImagePath,
          backImagePath,
        },
        // execArgv: ["--import", "tsx"],
      });

      worker.on("message", async (msg) => {
        await worker.terminate();
        if (msg.success) {
          resolve(msg.data);
        } else {
          reject(new Error(msg.message));
        }
      });

      worker.on("error", async (err) => {
        this.logger.error("Worker error", { error: err.message });
        reject(err);
        await worker.terminate();
      });
    });
  }
}
