import { describe, expect, it } from "vitest";
import { templates } from "@/lib/templates";
import {
  coverCrop,
  normalizeSticker,
  templateGeometry,
} from "@/lib/composition";
import { initialSession, sessionReducer, delay } from "@/lib/session";
import { studioCopy } from "@/lib/studio-copy";
import { parseGallery } from "@/hooks/use-photo-gallery";
describe("composition and capture state", () => {
  it.each(templates)(
    "keeps $id print size and all slots inside the canvas",
    (template) => {
      const result = templateGeometry(template);
      expect(result.width / result.height).toBeCloseTo(template.aspectRatio, 3);
      expect(result.slots).toHaveLength(template.photoCount);
      for (const slot of result.slots) {
        expect(slot.x).toBeGreaterThan(0);
        expect(slot.y).toBeGreaterThan(0);
        expect(slot.x + slot.width).toBeLessThan(result.width);
        expect(slot.y + slot.height).toBeLessThan(
          result.height - result.footer,
        );
      }
    },
  );
  it("center crops wide and tall sources without stretching them", () => {
    const slot = { x: 0, y: 0, width: 200, height: 100 };
    expect(coverCrop(800, 200, slot)).toEqual({
      scale: 0.5,
      cropX: 200,
      cropY: 0,
      width: 400,
      height: 200,
    });
    expect(coverCrop(200, 800, slot)).toEqual({
      scale: 1,
      cropX: 0,
      cropY: 350,
      width: 200,
      height: 100,
    });
  });
  it("bounds transformed stickers and normalizes rotation", () => {
    expect(
      normalizeSticker(
        {
          id: "a",
          stickerId: "a",
          src: "s",
          name: "a",
          x: -5,
          y: 2000,
          size: 5000,
          rotation: -15,
        },
        600,
        1800,
      ),
    ).toMatchObject({ x: 0, y: 1800, size: 600, rotation: 345 });
  });
  it("prevents more photos than slots and replaces exactly the retaken photo", () => {
    let state = initialSession;
    for (const src of ["a", "b", "c", "d", "duplicate"])
      state = sessionReducer(state, { type: "capture", src, count: 4 });
    expect(state.photos).toEqual(["a", "b", "c", "d"]);
    state = sessionReducer(state, { type: "retake", index: 1 });
    state = sessionReducer(state, {
      type: "capture",
      src: "replacement",
      count: 4,
    });
    expect(state.photos).toEqual(["a", "replacement", "c", "d"]);
    expect(state.retakeIndex).toBeNull();
  });
  it("reset drops pending retake identity and changes layout", () => {
    expect(
      sessionReducer(
        { ...initialSession, photos: ["a"], retakeIndex: 0 },
        { type: "reset", templateId: "2x3" },
      ),
    ).toEqual({ templateId: "2x3", photos: [], retakeIndex: null });
  });
  it("cancels a countdown before capture", async () => {
    const controller = new AbortController();
    const promise = delay(10000, controller.signal);
    controller.abort();
    await expect(promise).rejects.toThrow("Cancelled");
  });
  it("validates gallery data before loading it", () => {
    expect(parseGallery(null)).toEqual([]);
    expect(() =>
      parseGallery('[{"id":"a","src":"https://example.com","timestamp":0}]'),
    ).toThrow();
  });
  it("has the same studio controls and five layouts in every language", () => {
    for (const value of Object.values(studioCopy)) {
      expect(Object.keys(value).sort()).toEqual(
        Object.keys(studioCopy.en).sort(),
      );
      expect(value.layoutNames).toHaveLength(5);
    }
  });
});
