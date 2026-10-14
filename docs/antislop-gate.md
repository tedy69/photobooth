# Antislop Delivery Gate

Mode: during, session override. Date: 2026-10-14.
Direction: DESIGN.md, ENERGY 3 / RHYTHM 3 / MOTION 2.
Evidence: docs/acceptance.md, tests/e2e/studio.spec.ts, 37 focused tests and 14
passing browser scenarios against the production standalone server. Physical
camera/device and provider delivery limits are explicitly recorded in acceptance.
The owner approved direct email while the support provider key is unavailable.

## Hard Gate

- R-02 PASS: scan of new app, component, studio/privacy copy and delivery prose finds no em dashes.
- R-03 PASS: zero horizontal overflow at 320/390/768/1024/1440 across the studio and supporting routes in both themes and all six languages; German privacy heading wraps; mobile camera empty/error content grows rather than clipping.
- R-17 PASS: displayed counts derive from template slots and saved photos; no usage or performance statistics.
- R-18 PASS: no testimonials, customer avatars or invented identities.
- R-23 PASS: original logo, all existing SVG assets and original demo photo references retained; samples explicitly labelled; asset provenance in docs/assets.md.
- R-24 PASS: site navigation click-through reaches /, /demo, /support, /privacy and /terms; direct email has a real mailto address.
- R-25 PASS: contrast checker ratios recorded in acceptance; axe finds no violations on the editor across six languages and two themes and on all supporting routes.
- R-26 PASS: capture, layout, retake, edit, gallery, theme, language, tools, disclosures, dialogs and downloads have exercised behaviors; unconfigured support is visibly disabled with a direct email alternative, as approved.
- R-27 PASS: camera off/requesting/error, composition loading/error, gallery empty/storage error, export failure and support loading/unavailable/provider response states are present and tested.
- R-28 PASS: support disclosures describe this app's camera, strip editor, export and browser storage behavior; no generic marketing FAQ.
- R-32 PASS: skip link Tab/Enter, visible focus, native keyboard-operated sliders, native confirmation/photo dialogs and Escape tested; controls use semantic buttons/selects/inputs.
- R-33 PASS: features implemented in TypeScript/TSX/CSS source; no external source or CSS string-replacement patcher. Prettier formats source; the standalone packager copies build assets only.
- R-34 PASS: light and dark palettes tested with the same composition and language/viewport matrix.
- R-35 PASS: production build and click-through run; all 14 browser scenarios pass. Element-by-element results and unrun physical-device limits are in acceptance.
- R-36 PASS: privacy statements map to observed source behavior and disclosed support/hosting paths; no fabricated compliance, security or performance promises.
- R-37 PASS: owner supplied studio direction and dial targets; DESIGN.md was created before implementation.
- R-38 PASS: original product capabilities preserved and audited; samples labelled; no fictional data or ghost routes.

## Purpose Gate

- R-01 PASS: neutral paper/ink application surfaces; retained gradients are user-selected composition backgrounds, with purpose documented in DESIGN.md.
- R-04 PASS: original camera logo marks the camera; shutter glyph marks capture; original stars/hearts/etc are photo stickers, not decorative navigation icons. No default icon library remains.
- R-06 PASS: Georgia evokes printed photo captions; system sans supports readable controls and language coverage; written reasons in DESIGN.md.
- R-07 PASS: no decorative page grid/dots; preserved dot/stripe backgrounds belong to the user's strip and have an editing purpose.
- R-08 PASS: no decorative button arrows.
- R-09 PASS: no promotional capsule badges or eyebrow label above the headline; sample labels communicate actual mode.
- R-10 PASS: no glassmorphism.
- R-12 PASS: small shadows belong only to the physical strip/canvas sheet; workspace/tools remain flat.
- R-13 PASS: no glow effects.
- R-14 PASS: equal layout buttons are comparisons of five actual layouts; camera, strip, tools, gallery and document compositions differ by function.
- R-19 PASS: selection transitions and a brief capture flash communicate actions; reduced motion suppresses them; no endless animation.
- R-22 PASS: no generic illustrations; original photographs and actual application screenshots supply imagery.

## Liveliness

- Dials PASS: ENERGY 3 / RHYTHM 3 / MOTION 2 declared before generation and in DESIGN.md.
- Dial consistency PASS: expressive sample/camera photography, large caption typography, contrasting capture/edit/gallery/prose composition and restrained capture/selection feedback are visible in screenshots.
- Focal point PASS: camera stage dominates capture; actual strip dominates editing; saved photos dominate gallery.
- Whitespace PASS: documented spacing separates layout, capture, review and editing tools; responsive reflow preserves useful image space.
- Accent PASS: citron marks capture/export actions against neutral application surfaces; colorful materials belong to photographs.
- Identity PASS: real strip geometry, numbered photo slots, printed captions, original camera logo and contact-sheet thumbnails repeat across the workspace.
- Design Read PASS: studio/audience/visual language/dials declared before editing and recorded in DESIGN.md.

## Craftsmanship and Quality Locks

- C-1 PASS: major palette/type/layout/spacing/asset/motion decisions have written product reasons in DESIGN.md.
- C-2 PASS: every control group has recorded behavior; unavailable provider delivery is explicit and approved.
- C-3 PASS: app sections exist for layout, capture, review, editing, export, storage or support/legal content; no filler landing page.
- C-4 PASS: empty/loading/error, themes, languages, viewport matrix, keyboard and simulated touch/pointer tests pass. Physical-device limits are bounded in acceptance.
- C-5 PASS: no testimonial, statistic or factual claim invented.
- R-05 PASS: workspace composition follows the current task; no hero/features/testimonials template, bento, pricing or fake terminal.
- R-11 PASS: varied radii: square strip, 6px controls, 12/16px stage/dialog surfaces; no blanket pills.
- R-15 PASS: Enable camera, Take Photo, Retake, Edit photo strip, Save to Gallery and Download Strip describe their actions.
- R-16 PASS: no authored marketing buzzwords or decorative emoji in application copy.
- R-20 PASS: five physical strip layouts, numbered shot tray and photo materials make the workspace specific to Photobooth.
- R-21 PASS: light default reflects paper studio direction, with an exercised dark theme switch.
- R-29 PASS: neutral paper/ink/tool surfaces plus one citron action accent; approved logo and photo materials are documented exceptions with clear purpose.
- R-30 PASS: design follows the owner's photo-studio brief and actual workflow; no requested or unrequested product clone.
- R-31 PASS: reasons for every major choice are written in DESIGN.md.

## Supplementary skills

- UI PASS: retained assets, action-specific accent, distinct screen compositions and purposeful restrained motion verified in screenshots and click-through.
- Copywriting PASS: direct task labels, factual privacy copy, specific recovery paths, no fabricated claims or generic marketing sections; all six languages remain selectable.
- Human PASS: checker/axe contrast evidence, semantic controls, focus/Escape/keyboard, status/error announcements, and 200% text-resize reflow recorded. Actual mobile keyboards remain unrun and are not claimed.
- Mobile layout PASS: designed phone/tablet/desktop states, no horizontal overflow, 44px controls, normal-flow mobile tools and simulated touch controls verified.
