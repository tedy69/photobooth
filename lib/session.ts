export interface Session {
  templateId: string;
  photos: string[];
  retakeIndex: number | null;
}
export type SessionAction =
  | { type: "capture"; src: string; count: number }
  | { type: "retake"; index: number }
  | { type: "reset"; templateId?: string };
export const initialSession: Session = {
  templateId: "4x1",
  photos: [],
  retakeIndex: null,
};
export function sessionReducer(state: Session, action: SessionAction): Session {
  if (action.type === "reset")
    return {
      ...initialSession,
      templateId: action.templateId ?? state.templateId,
    };
  if (action.type === "retake")
    return action.index >= 0 && action.index < state.photos.length
      ? { ...state, retakeIndex: action.index }
      : state;
  if (!action.src) return state;
  if (state.retakeIndex !== null) {
    const photos = [...state.photos];
    photos[state.retakeIndex] = action.src;
    return { ...state, photos, retakeIndex: null };
  }
  if (state.photos.length >= action.count) return state;
  return { ...state, photos: [...state.photos, action.src] };
}
export function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException("Cancelled", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, ms);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
  });
}
export const samplePhotos = Array.from(
  { length: 6 },
  (_, i) => `/samples/0${i + 1}.jpg`,
);
