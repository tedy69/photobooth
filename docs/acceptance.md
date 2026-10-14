# Photobooth acceptance evidence

Date: 2026-10-14 (Asia/Jakarta).

## Automated checks

- TypeScript: `npm run type-check`.
- ESLint: `npm run lint`, zero-warning policy, no build-error suppression.
- Focused tests: camera permission classification and recovery, delayed video
  readiness, cancellation and late streams, track interruption/unmount cleanup,
  mirror capture, bounded strip state/retakes, print geometry/cropping and sticker
  transforms, existing gallery validation, and support validation/mock responses.
- Browser: the production standalone server, Chromium with a fake camera device,
  and a separate touch context. See tests/e2e/studio.spec.ts and the generated
  Playwright report. Tests use local samples and mocked support provider results.
- Dependency auditing: `npm audit` and `npm audit --omit=dev`; zero vulnerabilities.
- Production build: Next.js standalone output including /api/support and /api/health.
- Reproducibility: fresh `npm ci --ignore-scripts` from the committed lockfile;
  pinned Node 22 Alpine image digest for Linux build and runtime.

## Browser click-through record

- Every layout button: selected layout and slot count update, all five layouts
  export with their 300ppi print dimensions and the intended sample image in each
  slot. Center pixel neighborhoods are compared against the retained source photos.
- Enable camera: synthetic device produces ready video dimensions; capture gets
  an image. Mirror is a camera-only control with consistent video/capture behavior.
- Permission denial: recovery copy and Retry remain available; no sample image is
  inserted. Use sample photos explicitly switches to a labelled sample mode.
- Countdown select: zero-delay capture and three-second cancellation are tested.
  Automatic strip completes with five-second spacing; Cancel stops pending shots.
- Take Photo: all required slots fill. Retake 2 replaces exactly that slot. The
  reducer rejects extra slots, and the capture coordinator prevents concurrent jobs.
- Edit photo strip: real Fabric canvas opens. Loading and error states are visible.
- Background buttons: all 12 apply and render. All four frame buttons render;
  photos remain visible. The exported margin contains the selected gold frame.
- Sticker buttons: all 15 render. Search filters to a matching sticker and returns
  an honest empty result for no match. Selected-sticker select, position, size,
  rotation, remove and clear controls work. Exported pixels include the heart.
- Pointer editing: dragging after responsive resizing updates canonical x/y.
  Touch editing: deselect/reselect on canvas, native size control, and remove work.
- File format select: PNG gallery output and JPEG download are decoded/checked.
  Download photo strip produces a real download. Export failure retains edits
  and a subsequent retry succeeds.
- Save to Gallery: persists the rendered composition. A synthetic quota error
  reports failure and leaves download usable. Gallery uses the original storage key.
- Gallery: view opens a native dialog; Escape closes it. Download starts. Delete
  requires confirmation; Cancel keeps the photo and Continue removes it.
- New session: Escape preserves the composition; Continue clears the current session.
- Language select: all six languages update document language; both themes and
  320, 390, 768, 1024 and 1440px widths reflow. Composition survives those changes.
- Theme switch: both palettes render and retain composition. Axe checks find no
  violations on the editor in all six languages/themes and on supporting routes.
- Skip link: Tab focuses a visible 3px ring; Enter reaches the content. Native
  sliders respond to keyboard. Reduced-motion disables transitions and shutter flash.
- /demo, /support, /privacy, /terms: real routes render; translated narrow layouts
  are checked. Support disclosures open and close. Empty form validates locally;
  mocked provider failure preserves fields and mocked success resets them.
- Unconfigured support: visibly states delivery is unavailable, disables submission,
  and offers the working mailto:gmail@tedyfazrin.com link, per the owner's decision.

## Contrast

The antislop-human contrast checker was run, and axe inspected rendered text.

| Pair              | Usage                  | Ratio   | Result              |
| ----------------- | ---------------------- | ------- | ------------------- |
| #595c54 / #f5f3ec | Light muted text       | 6.13:1  | PASS                |
| #20231f / #e4ee81 | Shutter/action text    | 12.75:1 | PASS                |
| #c0c3b7 / #2c302a | Dark muted text        | 7.50:1  | PASS                |
| #87897d / #fffef9 | Light control boundary | 3.52:1  | PASS (non-text 3:1) |
| #969b8a / #20231f | Dark control boundary  | 5.56:1  | PASS                |

## Limits of this evidence

Synthetic camera tests are automated media evidence. Physical cameras, real
permission denial on iOS/Android, interrupted mobile sessions, mobile virtual
keyboards, and device-specific image download behavior are not physical-device
acceptance. No real support message was sent. The owner chose direct email while
the Web3Forms key is unavailable; provider delivery remains unconfigured.

Gallery capacity depends on browser localStorage quota. This preserves the
existing storage mechanism and reports quota failures honestly. Downloads remain
available when a gallery save fails. Refreshing ends unsaved edit sessions.

Final local results: 37 focused tests passed, 14 browser scenarios passed,
TypeScript/lint/build passed, and full/production dependency audits report zero
vulnerabilities. Text resizing to 200% at 390px passed. The gallery quota test
also confirms existing saved photos remain available for viewing/downloading
when a later save fails.

The first VPS activation attempt exercised configuration rollback: an immediate
health request reached old Nginx workers during reload and restored the bootstrap
configuration. The activation script now waits for the expected revision through
the graceful handover. Public DNS was unchanged during that check.
