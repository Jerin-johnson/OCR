import PQueue from "p-queue";

export const ocrQueue = new PQueue({
  concurrency: 1,
});
