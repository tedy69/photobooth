# Existing capability audit

Base: origin/main (original repository inspected before implementation).

- Layouts: Classic Strip 2 × 6 in (4 photos), Triple Strip 2 × 4.5 in (3), 2 × 3 Grid 4 × 6 in (6), square grid 4 × 4 in (4), Single Photo 4 × 6 in (1). All retained. Print composition uses 300 pixels per inch and center-cover crops, rather than deriving output size from the first camera frame.
- Capture: single, countdown, and timed strip. All retained through one-at-a-time capture, selectable 0/3/5-second countdown and automatic strip with five-second spacing. No automatic permission request or image substitution on failure.
- Editing: all 15 existing SVG stickers, all 12 backgrounds, and all four frames retained. Move, resize and rotation supported through Fabric pointer controls and labelled controls. Frame SVGs are composed behind photograph slots so their opaque fill cannot hide photos.
- Export: PNG edited photos and JPEG strip composition were supported by the original utilities. Both formats are explicit options for the finished composition. Gallery retains PNG exports.
- Gallery: original `galleryPhotos` localStorage key, data-URL images, timestamps, view, download and deletion retained. Failed storage writes no longer pretend to save photos. Existing data is validated without overwriting it on error.
- Languages: English, Spanish, French, German, Japanese, Simplified Chinese. All retained. The previous metadata advertised nonexistent Portuguese and locale routes; removed those false destinations.
- Themes: next-themes existed but had no visible switch. A working theme switch is now present. Composition colors are independent of the UI theme.
- Routes: /, /demo, /support, /privacy, /terms retained. /demo uses the functional studio with explicit sample selection. The original six Unsplash photograph references are bundled under /samples so sample mode has no external image request.
- Support: /api/support POST forwards submitted fields to Web3Forms with a server-side access key. Validation, bounded provider wait, honest unavailable/error responses and duplicate-submit prevention replace the false-success mailto fallback. Direct email is a separate visible link. No production test message is sent.
- Privacy: camera images, composition and saved gallery remain local. Hosting access logs and support-form forwarding are disclosed. No analytics scripts are installed. Existing photo handling made no network upload calls.

Deployment audit: hostname was on Vercel with a Cloudflare-managed CNAME. VPS is 169.58.68.189. Ports 80/443 belong to the Docker ihsg-bot ingress. Active config is /tmp/nginx.conf generated from the mounted template, not the image's default nginx.conf. Portfolio root and Telegram routes share the existing default virtual host. Photobooth must receive an independent server block and Next.js runtime; no portfolio location is replaced.
