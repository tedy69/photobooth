# Photobooth studio

Reading this as: a playful photo studio for people taking and making photo strips, in a paper-and-contact-sheet visual language. Dial: ENERGY 3 / RHYTHM 3 / MOTION 2.

## Palette

Warm paper (#f5f3ec), ink (#20231f), and an off-white tool surface keep faces and finished strips dominant. A single citron accent (#e4ee81) marks the shutter and selected actions; its dark text remains readable. Dark mode uses charcoal (#20231f) and warm pale text (#f5f3ec), with the same accent. The existing purple camera logo stays intact because it is an approved asset. Existing colorful stickers and background choices belong to the photograph, not the application's chrome.

## Typography

Georgia's broad, slightly nostalgic serif gives the studio heading the character of a printed photo caption. Arial and the user's system sans-serif keep controls, numbers, and translated text clear at small sizes. Use a fluid heading scale, sentence case, and normal tracking. Japanese and Chinese use system glyph fallbacks rather than downloading another font.

## Composition

The desktop workspace puts a compact layout chooser next to a broad camera stage and a narrow, tangible strip preview. The edit view gives the actual composition most of the room and a tool panel its own column. At intermediate widths the layout choices become a horizontal grid and the stage shares space with the strip. At narrow widths the camera and current action come first, followed by choices and tools in normal document flow. Tools never cover the image. The gallery uses the real aspect ratios of saved strips; the support and legal pages use readable prose, not repeated feature cards.

## Spacing and shapes

Use 4, 8, 12, 16, 24, 32, and 48px spacing steps. Tight spacing connects a label to its control; larger gaps separate capture, review, and editing. Buttons have a 6px radius, the camera stage 16px, and the physical strip square corners. A small shadow belongs only to the strip to distinguish a sheet of paper from the workspace. Equal layout buttons are comparison controls, not marketing cards.

## Identity and assets

The repeated motif is a printed contact sheet: numbered photo slots, photographic thumbnails, a narrow white margin, and a short caption beneath the strip. Layout miniatures illustrate actual slot geometry. Reuse /logo.svg, the existing SVG stickers and frames, and the six photographs already referenced by the original /demo. Store those samples locally and label them as sample photos. Do not introduce new portraits, branding, invented usage numbers, or testimonials. Screenshots document the running application.

## Interaction and motion

Enable camera is always explicit. Permission, video readiness, countdown, captured shots, selection, composition loading, and export each have visible text states. Restrained transitions signal selection and a brief shutter flash signals capture; reduced motion suppresses those effects. No decorative loops. Essential sticker moves, resize, rotation, and removal have labelled controls alongside pointer and touch gestures. Preview and capture share a mirror switch. Composition coordinates and print dimensions stay fixed while only the Fabric viewport changes.

## Copy and accessibility

Use direct labels: Enable camera, Take photo, Retake, Edit photo strip, Download photo strip. Sample mode is explicitly selected and labelled. Camera and export errors name a recovery action. All six existing languages remain selectable. Native buttons, labels, selects, disclosure elements, visible focus rings, 44px targets, status announcements, and a skip link support keyboard and touch use. Local photo processing, optional browser-local gallery persistence, and support-form transmission to Web3Forms are described separately.
