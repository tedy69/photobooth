import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
const layouts = [
  { name: "Classic strip", count: 4, width: 600, height: 1800 },
  { name: "Triple strip", count: 3, width: 600, height: 1350 },
  { name: "2 × 3 grid", count: 6, width: 1200, height: 1800 },
  { name: "Square grid", count: 4, width: 1200, height: 1200 },
  { name: "Single photo", count: 1, width: 1200, height: 1800 },
];
async function fillStrip(page: Page, count = 4) {
  await page
    .getByRole("button", { name: "Use sample photos", exact: true })
    .last()
    .click();
  await page.getByLabel("Countdown", { exact: true }).selectOption("0");
  for (let i = 0; i < count; i++) {
    await page.getByRole("button", { name: "Take Photo", exact: true }).click();
    await expect(page.locator(".photo-tray img")).toHaveCount(i + 1);
  }
  await page
    .getByRole("button", { name: "Edit photo strip", exact: true })
    .click();
  await expect(page.locator(".canvas-wrap")).toHaveAttribute(
    "aria-busy",
    "false",
  );
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
test("every layout exports all intended samples at fixed print dimensions", async ({
  page,
}) => {
  for (const layout of layouts) {
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("galleryPhotos"));
    await page.reload();
    await page
      .getByRole("button", {
        name: new RegExp(`^${layout.name.replace("×", "×")}`),
      })
      .click();
    await fillStrip(page, layout.count);
    await page
      .getByRole("button", { name: "Save to Gallery", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("saved");
    const pixels = await page.evaluate(async ({ width, height, count }) => {
      const saved = JSON.parse(localStorage.getItem("galleryPhotos")!)[0].src;
      const image = new Image();
      image.src = saved;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(image, 0, 0);
      const margin = Math.round(width * 0.045),
        gap = Math.round(width * 0.025),
        footer = Math.round(width * 0.12),
        columns = count === 6 || (count === 4 && width === 1200) ? 2 : 1,
        rows = Math.ceil(count / columns),
        slotWidth = (width - margin * 2 - gap * (columns - 1)) / columns,
        slotHeight = (height - margin * 2 - footer - gap * (rows - 1)) / rows;
      let matches = 0;
      for (let i = 0; i < count; i++) {
        const source = new Image();
        source.src = `/samples/0${i + 1}.jpg`;
        await source.decode();
        const srcCanvas = document.createElement("canvas");
        srcCanvas.width = source.width;
        srcCanvas.height = source.height;
        const srcCtx = srcCanvas.getContext("2d")!;
        srcCtx.drawImage(source, 0, 0);
        const mean = (pixels: Uint8ClampedArray) =>
          [0, 1, 2].map((channel) => {
            let sum = 0;
            for (let pixel = channel; pixel < pixels.length; pixel += 4)
              sum += pixels[pixel];
            return sum / (pixels.length / 4);
          });
        const expected = mean(
          srcCtx.getImageData(
            Math.floor(source.width / 2) - 2,
            Math.floor(source.height / 2) - 2,
            5,
            5,
          ).data,
        );
        const actual = mean(
          ctx.getImageData(
            Math.floor(
              margin + (i % columns) * (slotWidth + gap) + slotWidth / 2,
            ) - 2,
            Math.floor(
              margin +
                Math.floor(i / columns) * (slotHeight + gap) +
                slotHeight / 2,
            ) - 2,
            5,
            5,
          ).data,
        );
        if (
          Array.from(actual)
            .slice(0, 3)
            .every((value, j) => Math.abs(value - expected[j]) < 20)
        )
          matches++;
      }
      return { width: image.width, height: image.height, matches };
    }, layout);
    expect(pixels).toEqual({
      width: layout.width,
      height: layout.height,
      matches: layout.count,
    });
    await page.getByLabel("File format", { exact: true }).selectOption("jpeg");
    const download = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Download Strip", exact: true })
      .click();
    expect((await download).suggestedFilename()).toMatch(/\.jpg$/);
  }
});
test("all backgrounds, frames, stickers, search and accessible transformations work", async ({
  page,
}) => {
  await page.goto("/");
  await fillStrip(page);
  const backgrounds = [
    "White",
    "Soft Pink",
    "Soft Blue",
    "Soft Yellow",
    "Soft Green",
    "Soft Purple",
    "Sunset",
    "Ocean",
    "Rainbow",
    "Cosmic",
    "Polka Dots",
    "Stripes",
  ];
  for (const summary of await page.locator(".editor-tools summary").all()) {
    await summary.click();
    await summary.click();
  }
  for (const name of backgrounds) {
    await page
      .locator(".background-options")
      .getByRole("button", { name, exact: true })
      .click();
    await expect(page.locator(".canvas-wrap")).toHaveAttribute(
      "aria-busy",
      "false",
    );
  }
  for (const name of ["None", "Polaroid", "Vintage", "Gold Frame"]) {
    await page
      .locator(".frame-options")
      .getByRole("button", { name, exact: true })
      .click();
    await expect(page.locator(".canvas-wrap")).toHaveAttribute(
      "aria-busy",
      "false",
    );
  }
  const stickerButtons = page.locator(".sticker-options button");
  expect(await stickerButtons.count()).toBe(15);
  for (const button of await stickerButtons.all()) {
    await button.click();
    await expect(page.locator(".canvas-wrap")).toHaveAttribute(
      "aria-busy",
      "false",
    );
  }
  await expect(
    page
      .getByRole("combobox", { name: "Selected sticker", exact: true })
      .locator("option"),
  ).toHaveCount(16);
  await page
    .getByRole("combobox", { name: "Selected sticker", exact: true })
    .selectOption({ index: 1 });
  await page
    .getByLabel("Horizontal position", { exact: true })
    .press("ArrowRight");
  await page
    .getByLabel("Vertical position", { exact: true })
    .press("ArrowRight");
  await page.getByLabel("Size", { exact: true }).press("ArrowRight");
  await page.getByLabel("Rotation", { exact: true }).press("ArrowRight");
  await expect(page.locator(".canvas-wrap")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  await page
    .getByRole("button", { name: "Remove sticker", exact: true })
    .click();
  await expect(
    page
      .getByRole("combobox", { name: "Selected sticker", exact: true })
      .locator("option"),
  ).toHaveCount(15);
  await page
    .getByRole("button", { name: "Clear Stickers", exact: true })
    .click();
  await expect(page.locator(".sticker-controls")).toHaveCount(0);
  await page.getByRole("searchbox").fill("no-matching-sticker");
  await expect(page.locator(".sticker-options button")).toHaveCount(0);
  await page.getByRole("searchbox").fill("heart");
  await page
    .locator(".sticker-options")
    .getByRole("button", { name: "Heart", exact: true })
    .click();
  await expect(page.locator(".canvas-wrap")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  await page.getByLabel("Rotation", { exact: true }).press("End");
  await expect(page.locator(".canvas-wrap")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  await page
    .getByRole("button", { name: "Save to Gallery", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("saved");
  const exported = await page.evaluate(async () => {
    const src = JSON.parse(localStorage.getItem("galleryPhotos")!)[0].src;
    const img = new Image();
    img.src = src;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    return {
      border: Array.from(ctx.getImageData(5, 5, 1, 1).data),
      heart: Array.from(ctx.getImageData(300, 900, 1, 1).data),
    };
  });
  expect(exported.border[0]).toBeGreaterThan(180);
  expect(exported.border[1]).toBeGreaterThan(110);
  expect(exported.heart[0]).toBeGreaterThan(exported.heart[1] + 60);
  await mkdir("output", { recursive: true });
  await page.screenshot({ path: "output/desktop-editor.png", fullPage: true });
});
test("capture cancellation, auto strip, individual retake, gallery view/download/delete and reset", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Use sample photos", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", {
      name: "Auto strip (5s between photos)",
      exact: true,
    })
    .click();
  await expect(page.locator(".countdown")).toHaveText("3");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator(".photo-tray img")).toHaveCount(0);
  await page.getByLabel("Countdown", { exact: true }).selectOption("0");
  await page
    .getByRole("button", {
      name: "Auto strip (5s between photos)",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", { name: "Edit photo strip", exact: true }),
  ).toBeVisible({ timeout: 25000 });
  await page.getByRole("button", { name: "Retake 2", exact: true }).click();
  await page.getByRole("button", { name: "Retake", exact: true }).click();
  await expect(page.locator(".photo-tray img")).toHaveCount(4);
  await page
    .getByRole("button", { name: "Edit photo strip", exact: true })
    .click();
  await expect(page.locator(".canvas-wrap")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  await page
    .getByRole("button", { name: "Save to Gallery", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("saved");
  await page
    .locator(".session-nav")
    .getByRole("button", { name: /Gallery/ })
    .click();
  await expect(page.locator(".gallery-grid article")).toHaveCount(1);
  await page.getByRole("button", { name: "View", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download", exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/\.png$/);
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator(".gallery-grid article")).toHaveCount(1);
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator(".gallery-grid article")).toHaveCount(0);
  await page
    .locator(".session-nav")
    .getByRole("button", { name: "Photo studio", exact: true })
    .click();
  await page.getByRole("button", { name: "New session", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(page.locator(".canvas-wrap")).toBeVisible();
  await page.getByRole("button", { name: "New session", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator(".photo-tray img")).toHaveCount(0);
});
test("synthetic camera capture has ready frames and stops on navigation", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = navigator.mediaDevices.getUserMedia.bind(
      navigator.mediaDevices,
    );
    (window as unknown as { testStopped: number }).testStopped = 0;
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      const stream = await original(constraints);
      for (const track of stream.getTracks()) {
        const stop = track.stop.bind(track);
        track.stop = () => {
          (window as unknown as { testStopped: number }).testStopped++;
          stop();
        };
      }
      return stream;
    };
  });
  await page.goto("/");
  expect(
    await page.evaluate(() => document.querySelector("video")?.srcObject),
  ).toBeNull();
  await page
    .getByRole("button", { name: "Enable camera", exact: true })
    .click();
  await expect(page.locator(".stage-toolbar")).toContainText("Camera ready");
  await page.getByLabel("Mirror camera and photos", { exact: true }).uncheck();
  expect(
    await page
      .locator("video")
      .evaluate((element) => getComputedStyle(element).transform),
  ).toBe("none");
  await page.getByLabel("Mirror camera and photos", { exact: true }).check();
  expect(
    await page
      .locator("video")
      .evaluate((element) => getComputedStyle(element).transform),
  ).toContain("-1");
  await page.getByLabel("Countdown", { exact: true }).selectOption("0");
  await page.getByRole("button", { name: "Take Photo", exact: true }).click();
  await expect(page.locator(".photo-tray img")).toHaveCount(1);
  await page
    .locator(".session-nav")
    .getByRole("button", { name: /Gallery/ })
    .click();
  expect(
    await page.evaluate(
      () => (window as unknown as { testStopped: number }).testStopped,
    ),
  ).toBe(1);
});
test("permission error and recovery never silently become sample mode", async ({
  page,
}) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      throw new DOMException("Denied", "NotAllowedError");
    };
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Enable camera", exact: true })
    .click();
  await expect(page.locator(".camera-empty").getByRole("alert")).toContainText(
    "permission was denied",
  );
  await expect(page.locator(".photo-tray img")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Take Photo", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.locator(".camera-empty").getByRole("alert")).toContainText(
    "permission was denied",
  );
  await page
    .getByRole("button", { name: "Use sample photos", exact: true })
    .first()
    .click();
  await expect(page.locator(".sample-label")).toHaveText("Sample photos");
});
test("both themes and all languages preserve composition across five widths", async ({
  page,
}) => {
  await page.goto("/");
  await fillStrip(page);
  await page
    .locator(".background-options")
    .getByRole("button", { name: "Soft Pink", exact: true })
    .click();
  await page
    .locator(".sticker-options")
    .getByRole("button", { name: "Heart", exact: true })
    .click();
  await expect(page.locator(".canvas-wrap")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  for (const theme of ["light", "dark"]) {
    await page.getByLabel("Language", { exact: true }).selectOption("en");
    if (theme === "dark")
      await page
        .getByRole("button", { name: "Dark theme", exact: true })
        .click();
    for (const lang of ["en", "es", "fr", "de", "ja", "zh"]) {
      await page.getByLabel("Language", { exact: true }).selectOption(lang);
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await noOverflow(page);
        expect(
          await page
            .locator(".canvas-container")
            .evaluate((element) => element.getBoundingClientRect().width),
        ).toBeLessThan(width);
      }
      await page.setViewportSize({ width: 390, height: 900 });
      const results = await new AxeBuilder({ page }).analyze();
      expect(
        results.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
    }
  }
  await page.getByLabel("Language", { exact: true }).selectOption("en");
  await page.getByRole("button", { name: "Light theme", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "output/mobile-editor.png", fullPage: true });
  await page
    .getByRole("button", { name: "Save to Gallery", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("saved");
});
test("routes, focus, reduced motion and mocked support responses", async ({
  page,
}) => {
  await page.route("**/api/health", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"status":"ok","supportConfigured":true}',
    }),
  );
  for (const route of ["/", "/demo", "/privacy", "/terms", "/support"]) {
    await page.goto(route);
    await page.setViewportSize({ width: 320, height: 900 });
    await noOverflow(page);
    expect(
      (await new AxeBuilder({ page }).analyze()).violations.map((v) => v.id),
    ).toEqual([]);
  }
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to studio" }),
  ).toBeFocused();
  expect(
    await page
      .getByRole("link", { name: "Skip to studio" })
      .evaluate((e) => getComputedStyle(e).outlineWidth),
  ).toBe("3px");
  await page.keyboard.press("Enter");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page
      .getByRole("button", { name: "Enable camera" })
      .evaluate((e) => getComputedStyle(e).transitionDuration),
  ).toBe("0s");
  await page.goto("/support");
  await page.getByRole("button", { name: "Send Message", exact: true }).click();
  expect(
    await page
      .getByLabel("Your Name", { exact: true })
      .evaluate((e: HTMLInputElement) => e.validity.valueMissing),
  ).toBe(true);
  for (const summary of await page.locator(".support-help summary").all()) {
    await summary.click();
    await summary.click();
  }
  await page.route("**/api/support", (route) =>
    route.fulfill({
      status: 502,
      contentType: "application/json",
      body: '{"error":"Mock failed"}',
    }),
  );
  await page.getByLabel("Your Name", { exact: true }).fill("Test only");
  await page.getByLabel("Your Email", { exact: true }).fill("test@example.com");
  await page.getByLabel("Subject", { exact: true }).fill("Mock request");
  await page
    .getByLabel("Message", { exact: true })
    .fill("Intercepted locally. This never reaches the server.");
  await page.getByRole("button", { name: "Send Message", exact: true }).click();
  await expect(page.locator("form").getByRole("alert")).toBeVisible();
  await expect(page.getByLabel("Message", { exact: true })).not.toBeEmpty();
  await page.unroute("**/api/support");
  await page.route("**/api/support", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"success":true}',
    }),
  );
  await page.getByRole("button", { name: "Send Message", exact: true }).click();
  await expect(page.getByRole("status")).toBeVisible();
  await expect(page.getByLabel("Message", { exact: true })).toBeEmpty();
});

test("unconfigured support clearly offers direct email", async ({ page }) => {
  await page.route("**/api/health", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"status":"ok","supportConfigured":false}',
    }),
  );
  await page.goto("/support");
  await expect(page.getByRole("status")).toContainText(
    "Form delivery is currently unavailable",
  );
  await expect(
    page.getByRole("button", { name: "Send Message", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("link", { name: "gmail@tedyfazrin.com", exact: true }),
  ).toHaveAttribute("href", "mailto:gmail@tedyfazrin.com");
});
test("export failure preserves the composition and supports a retry", async ({
  page,
}) => {
  await page.goto("/");
  await fillStrip(page);
  // Block a required image for the independent export render, while retaining the existing preview.
  await page.route("**/samples/01.jpg", (route) => route.abort());
  await page.evaluate(async () => {
    const cache = await caches.keys();
    for (const key of cache) await caches.delete(key);
  });
  // Corrupt only this test browser's dataURL encoder, then restore it for the retry.
  await page.evaluate(() => {
    const proto = HTMLCanvasElement.prototype;
    (
      window as unknown as { originalEncoder: typeof proto.toDataURL }
    ).originalEncoder = proto.toDataURL;
    proto.toDataURL = () => {
      throw new Error("Synthetic export failure");
    };
  });
  await page
    .getByRole("button", { name: "Download Strip", exact: true })
    .click();
  await expect(page.locator('.feedback[role="alert"]')).toContainText(
    "could not be exported",
  );
  await expect(page.locator(".canvas-wrap")).toBeVisible();
  await page.unroute("**/samples/01.jpg");
  await page.evaluate(() => {
    HTMLCanvasElement.prototype.toDataURL = (
      window as unknown as {
        originalEncoder: typeof HTMLCanvasElement.prototype.toDataURL;
      }
    ).originalEncoder;
  });
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download Strip", exact: true })
    .click();
  await download;
});
test("storage failure does not claim a gallery save or lose existing data", async ({
  page,
}) => {
  await page.goto("/");
  await fillStrip(page);
  await page
    .getByRole("button", { name: "Save to Gallery", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("saved");
  const existing = await page.evaluate(() =>
    localStorage.getItem("galleryPhotos"),
  );
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Full", "QuotaExceededError");
    };
  });
  await page
    .getByRole("button", { name: "Save to Gallery", exact: true })
    .click();
  await expect(page.locator('.feedback[role="alert"]')).toContainText(
    "storage is unavailable or full",
  );
  expect(await page.evaluate(() => localStorage.getItem("galleryPhotos"))).toBe(
    existing,
  );
  await expect(
    page.getByRole("button", { name: "Download Strip", exact: true }),
  ).toBeEnabled();
  await page
    .locator(".session-nav")
    .getByRole("button", { name: /Gallery/ })
    .click();
  await expect(page.locator(".gallery-grid article")).toHaveCount(1);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download", exact: true }).click();
  await download;
});
test("pointer editing changes canonical coordinates after responsive resizing", async ({
  page,
}) => {
  await page.goto("/");
  await fillStrip(page);
  await page.getByRole("button", { name: "Heart", exact: true }).click();
  await expect(page.locator(".canvas-wrap")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  await page.setViewportSize({ width: 768, height: 900 });
  const canvas = page.locator(".upper-canvas");
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Missing canvas");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 20,
    box.y + box.height / 2 + 20,
    { steps: 8 },
  );
  await page.mouse.up();
  await expect(page.locator(".canvas-wrap")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  expect(
    Number(
      await page
        .getByLabel("Horizontal position", { exact: true })
        .inputValue(),
    ),
  ).toBeGreaterThan(300);
  expect(
    Number(
      await page.getByLabel("Vertical position", { exact: true }).inputValue(),
    ),
  ).toBeGreaterThan(900);
});
test("capture layout and supporting routes reflow in both themes and six languages", async ({
  page,
}) => {
  for (const route of ["/", "/demo", "/privacy", "/terms", "/support"]) {
    await page.goto(route);
    for (const dark of [false, true]) {
      if (dark) await page.locator(".theme-control").click();
      for (const lang of ["en", "es", "fr", "de", "ja", "zh"]) {
        await page.getByLabel("Language", { exact: true }).selectOption(lang);
        for (const width of [320, 390, 768, 1024, 1440]) {
          await page.setViewportSize({ width, height: 900 });
          await noOverflow(page);
        }
      }
      await page.getByLabel("Language", { exact: true }).selectOption("en");
      if (dark) await page.locator(".theme-control").click();
    }
  }
});

test("touch selection and native editing controls remain usable", async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(process.env.PHOTOBOOTH_URL ?? "http://localhost:3020");
  await fillStrip(page);
  await page.getByRole("button", { name: "Heart", exact: true }).tap();
  await expect(page.locator(".canvas-wrap")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  const canvas = page.locator(".upper-canvas");
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Missing canvas");
  await page.touchscreen.tap(box.x + 5, box.y + 5);
  await expect(
    page.getByRole("combobox", { name: "Selected sticker", exact: true }),
  ).toHaveValue("");
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await expect(
    page.getByRole("combobox", { name: "Selected sticker", exact: true }),
  ).not.toHaveValue("");
  const slider = page.getByLabel("Size", { exact: true });
  await slider.scrollIntoViewIfNeeded();
  await slider.tap();
  await noOverflow(page);
  await page.getByRole("button", { name: "Remove sticker", exact: true }).tap();
  await expect(page.locator(".sticker-controls")).toHaveCount(0);
  await context.close();
});

test("site links, countdown choices, and 200 percent text size work", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Countdown", { exact: true }).selectOption("5");
  await expect(page.getByLabel("Countdown", { exact: true })).toHaveValue("5");
  await page.getByRole("link", { name: "Demo", exact: true }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await page
    .locator("header")
    .getByRole("link", { name: "Support Center", exact: true })
    .click();
  await expect(page).toHaveURL(/\/support$/);
  await page
    .locator("footer")
    .getByRole("link", { name: "Privacy Policy", exact: true })
    .click();
  await expect(page).toHaveURL(/\/privacy$/);
  await page
    .getByRole("link", { name: "Back to Photo Booth", exact: true })
    .click();
  await expect(page).toHaveURL(/\/$/);
  await page
    .locator("footer")
    .getByRole("link", { name: "Terms of Service", exact: true })
    .click();
  await expect(page).toHaveURL(/\/terms$/);
  await page
    .getByRole("link", { name: "Photo Booth by Tedy Fazrin", exact: true })
    .click();
  await expect(page).toHaveURL(/\/$/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  await noOverflow(page);
  await expect(
    page.getByRole("button", { name: "Enable camera", exact: true }),
  ).toBeVisible();
  await page.goto("/support");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  await noOverflow(page);
});
