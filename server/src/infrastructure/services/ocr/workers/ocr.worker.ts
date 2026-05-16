import { createWorker } from "tesseract.js";

let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

export async function getOCRWorker() {
  if (!worker) {
    worker = await createWorker("eng+hin", 1, {
      logger: () => {},
    });

    await worker.setParameters({
      preserve_interword_spaces: "1",
    });
  }

  return worker;
}
