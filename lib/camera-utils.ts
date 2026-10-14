export type CameraFailure =
  | "denied"
  | "missing"
  | "busy"
  | "unavailable"
  | "readiness"
  | "capture";
export function cameraFailure(error: unknown): CameraFailure {
  if (error instanceof DOMException) {
    if (["NotAllowedError", "SecurityError"].includes(error.name))
      return "denied";
    if (["NotFoundError", "OverconstrainedError"].includes(error.name))
      return "missing";
    if (["NotReadableError", "AbortError"].includes(error.name)) return "busy";
  }
  return "unavailable";
}
export function stopMediaStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}
export function hasUsableFrame(video: HTMLVideoElement) {
  return video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0;
}
export function waitForVideoFrame(
  video: HTMLVideoElement,
  signal: AbortSignal,
  timeout = 10000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let frameId: number | undefined;
    const cleanup = () => {
      clearTimeout(timer);
      video.removeEventListener("loadeddata", check);
      video.removeEventListener("canplay", check);
      signal.removeEventListener("abort", abort);
      if (frameId !== undefined) video.cancelVideoFrameCallback?.(frameId);
    };
    const finish = () => {
      cleanup();
      resolve();
    };
    const abort = () => {
      cleanup();
      reject(new DOMException("Cancelled", "AbortError"));
    };
    const check = () => {
      if (hasUsableFrame(video)) {
        if (video.requestVideoFrameCallback) {
          if (frameId === undefined)
            frameId = video.requestVideoFrameCallback(finish);
        } else finish();
      }
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Video readiness timeout"));
    }, timeout);
    video.addEventListener("loadeddata", check);
    video.addEventListener("canplay", check);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
    else check();
  });
}
export function capturePhotoFromVideo(
  video: HTMLVideoElement,
  flipHorizontal = true,
): string {
  if (!hasUsableFrame(video)) throw new Error("No usable video frame");
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  if (flipHorizontal) {
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
  }
  context.drawImage(video, 0, 0);
  const result = canvas.toDataURL("image/jpeg", 0.95);
  if (!result.startsWith("data:image/jpeg")) throw new Error("Capture failed");
  return result;
}
