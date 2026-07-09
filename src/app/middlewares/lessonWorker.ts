import { parentPort, workerData } from "worker_threads";
import { fileUploader } from "./fileUploader";


(async () => {
  try {
    const { lessonId, file } = workerData;

    const uploadResult = await fileUploader.uploadToDigitalOcean(file);

    parentPort?.postMessage({
      success: true,
      lessonId,
      videoUrl: uploadResult.Location,
    });
  } catch (err: any) {
    parentPort?.postMessage({ success: false, error: err.message });
  }
})();
