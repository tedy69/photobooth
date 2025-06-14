/**
 * Camera utilities for photo booth functionality
 */

export interface CameraConfig {
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
}

export interface CaptureOptions {
  quality?: number;
  format?: 'image/jpeg' | 'image/png';
  flipHorizontal?: boolean;
}

/**
 * Initializes camera stream
 */
export async function initializeCamera(config: CameraConfig = {}): Promise<MediaStream> {
  const { facingMode = 'user', width, height } = config;

  const constraints: MediaStreamConstraints = {
    video: {
      facingMode,
      ...(width && { width }),
      ...(height && { height }),
    },
    audio: false,
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  } catch {
    throw new Error('Failed to access camera. Please check permissions.');
  }
}

/**
 * Captures a photo from video element
 */
export function capturePhotoFromVideo(
  video: HTMLVideoElement,
  options: CaptureOptions = {},
): string | null {
  const { quality = 0.8, format = 'image/jpeg', flipHorizontal = true } = options;

  try {
    // Create canvas to capture video frame
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Could not get canvas context');
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Save context state and apply horizontal flip if needed
    context.save();

    if (flipHorizontal) {
      context.scale(-1, 1);
      context.translate(-canvas.width, 0);
    }

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Restore context state
    context.restore();

    // Convert canvas to data URL
    return canvas.toDataURL(format, quality);
  } catch {
    return null;
  }
}

/**
 * Creates a flash effect element
 */
export function createFlashEffect(container: Element, duration = 200): void {
  const flashElement = document.createElement('div');
  flashElement.className = 'fixed inset-0 bg-white z-50 opacity-80 h-screen';

  container.appendChild(flashElement);

  setTimeout(() => {
    if (container.contains(flashElement)) {
      container.removeChild(flashElement);
    }
  }, duration);
}

/**
 * Stops all tracks in a media stream
 */
export function stopMediaStream(stream: MediaStream | null): void {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
}

/**
 * Checks if camera permissions are available
 */
export async function checkCameraPermissions(): Promise<boolean> {
  try {
    const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
    return permissions.state === 'granted';
  } catch {
    // Fallback: try to access camera directly
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stopMediaStream(stream);
      return true;
    } catch {
      return false;
    }
  }
}
