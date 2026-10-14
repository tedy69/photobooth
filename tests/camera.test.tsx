import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { useCamera } from "@/hooks/use-camera";
import {
  cameraFailure,
  capturePhotoFromVideo,
  hasUsableFrame,
  waitForVideoFrame,
} from "@/lib/camera-utils";
function video(ready = false) {
  const element = document.createElement("video");
  Object.defineProperties(element, {
    readyState: { value: ready ? 2 : 0, configurable: true },
    videoWidth: { value: ready ? 640 : 0, configurable: true },
    videoHeight: { value: ready ? 480 : 0, configurable: true },
  });
  element.play = vi.fn().mockResolvedValue(undefined);
  element.pause = vi.fn();
  return element;
}
function stream() {
  const track = { stop: vi.fn(), onended: null as (() => void) | null };
  return {
    track,
    value: {
      getTracks: () => [track],
      getVideoTracks: () => [track],
    } as unknown as MediaStream,
  };
}
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
describe("camera recovery and lifecycle", () => {
  it.each([
    ["NotAllowedError", "denied"],
    ["NotFoundError", "missing"],
    ["NotReadableError", "busy"],
    ["SecurityError", "denied"],
  ])("classifies %s", (name, code) =>
    expect(cameraFailure(new DOMException("", name))).toBe(code),
  );
  it("does not capture before a frame exists", () => {
    expect(hasUsableFrame(video())).toBe(false);
    expect(() => capturePhotoFromVideo(video())).toThrow("No usable");
  });
  it("readiness waits for actual dimensions and loaded data", async () => {
    const element = video();
    const signal = new AbortController();
    const promise = waitForVideoFrame(element, signal.signal);
    let settled = false;
    void promise.then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);
    Object.defineProperties(element, {
      readyState: { value: 2 },
      videoWidth: { value: 640 },
      videoHeight: { value: 480 },
    });
    element.dispatchEvent(new Event("loadeddata"));
    await promise;
    expect(settled).toBe(true);
  });
  it("bounds delayed readiness and removes its timer", async () => {
    vi.useFakeTimers();
    const pending = waitForVideoFrame(
      video(),
      new AbortController().signal,
      25,
    );
    const assertion = expect(pending).rejects.toThrow("readiness");
    await vi.advanceTimersByTimeAsync(25);
    await assertion;
    expect(vi.getTimerCount()).toBe(0);
  });
  it("aborts readiness and removes listeners and timers", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const element = video();
    const remove = vi.spyOn(element, "removeEventListener");
    const pending = waitForVideoFrame(element, controller.signal);
    const assertion = expect(pending).rejects.toThrow("Cancelled");
    controller.abort();
    await assertion;
    expect(remove).toHaveBeenCalledWith("loadeddata", expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
  });
  it("stops a late stream after cancellation, without binding it", async () => {
    let finish!: (value: MediaStream) => void;
    const media = stream();
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn(
          () =>
            new Promise<MediaStream>((resolve) => {
              finish = resolve;
            }),
        ),
      },
    });
    const { result } = renderHook(useCamera);
    const element = video(true);
    result.current[0].current = element;
    let pending!: Promise<void>;
    act(() => {
      pending = result.current[1].startCamera();
    });
    act(() => result.current[1].stopCamera());
    await act(async () => {
      finish(media.value);
      await pending;
    });
    expect(media.track.stop).toHaveBeenCalledTimes(1);
    expect(element.srcObject).toBeNull();
    expect(result.current[1].status).toBe("off");
  });
  it("shows denial without inserting a sample, then recovers and cleans up on unmount", async () => {
    const media = stream();
    const getUserMedia = vi
      .fn()
      .mockRejectedValueOnce(new DOMException("", "NotAllowedError"))
      .mockResolvedValue(media.value);
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });
    const { result, unmount } = renderHook(useCamera);
    const element = video(true);
    result.current[0].current = element;
    await act(() => result.current[1].startCamera());
    expect(result.current[1].error).toBe("denied");
    expect(element.srcObject).toBeNull();
    await act(() => result.current[1].startCamera());
    expect(result.current[1].status).toBe("ready");
    unmount();
    expect(media.track.stop).toHaveBeenCalledTimes(1);
    expect(element.srcObject).toBeNull();
    expect(element.pause).toHaveBeenCalled();
  });
  it("reports a stream interruption and stops the track", async () => {
    const media = stream();
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue(media.value) },
    });
    const { result } = renderHook(useCamera);
    result.current[0].current = video(true);
    await act(() => result.current[1].startCamera());
    act(() => media.track.onended?.());
    expect(result.current[1].status).toBe("error");
    expect(result.current[1].error).toBe("busy");
    expect(media.track.stop).toHaveBeenCalled();
  });
  it("captures the full usable frame and mirrors only when selected", () => {
    const drawImage = vi.fn();
    const translate = vi.fn();
    const scale = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage,
      translate,
      scale,
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
      "data:image/jpeg;base64,photo",
    );
    capturePhotoFromVideo(video(true), true);
    expect(translate).toHaveBeenCalledWith(640, 0);
    expect(scale).toHaveBeenCalledWith(-1, 1);
    expect(drawImage).toHaveBeenCalled();
    scale.mockClear();
    capturePhotoFromVideo(video(true), false);
    expect(scale).not.toHaveBeenCalled();
  });
});
