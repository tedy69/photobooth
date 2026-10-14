# Photo Booth

A browser photo studio built with Next.js, TypeScript and Fabric.js. Capture a
photo strip, edit it with stickers, backgrounds and frames, then download PNG or
JPEG. Camera access is explicit. Photo processing is local.

## Run locally

Use Node.js 22 or newer.

```sh
npm ci --ignore-scripts
npm run dev
```

For a production build:

```sh
npm run build
mkdir -p .next/standalone/.next
cp -R public .next/standalone/public
cp -R .next/static .next/standalone/.next/static
PORT=3000 HOSTNAME=127.0.0.1 node .next/standalone/server.js
```

Next.js standalone output includes the /api/support server endpoint. Do not
replace this deployment with a static export.

## Verify

```sh
npm run type-check
npm run lint
npm test
npm audit
npm run build
npx playwright install chromium
npm run test:e2e
```

Run a production server at port 3020 for the browser tests, or set
`PHOTOBOOTH_URL` to the candidate URL. Browser tests use fake camera devices and
intercept support delivery; no unsolicited support messages are sent.

## Capabilities and data

Five existing layouts, 15 stickers, 12 backgrounds, four frames, six languages,
light and dark themes, a browser-local gallery, and PNG/JPEG export are retained.
See [the capability audit](docs/capability-audit.md), [design decisions](DESIGN.md),
[asset provenance](docs/assets.md), and [deployment instructions](docs/deployment.md).
Gallery photos retain the original `galleryPhotos` localStorage key. A storage
failure is reported without overwriting existing images. Download photos before
clearing website data. Samples are labelled and use the original demo assets.

## Support configuration

Set `WEB3FORMS_ACCESS_KEY` in the server runtime environment, and optionally set
`SUPPORT_EMAIL` (defaults to gmail@tedyfazrin.com). Never use a NEXT_PUBLIC key or
commit secrets. Missing configuration returns HTTP 503 with a direct email
option. Provider failures return HTTP 502 and preserve the form text.

## License

MIT, see [LICENSE](LICENSE).
