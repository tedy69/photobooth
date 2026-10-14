# Photobooth VPS release and rollback

Host: 169.58.68.189. Photobooth has its own image, containers, release directories
and server configuration. The existing Docker `ihsg-bot-ingress-1` owns 80/443.
Its default host still owns the portfolio and Telegram routes.

## Locations

- `/srv/photobooth/releases/<full-commit>`: immutable Git source archive, recorded port and container name.
- `/srv/photobooth/current`: symlink to the active release.
- `/srv/photobooth/previous`: previous active release path, when one exists.
- `/srv/photobooth/shared/runtime.env`: root-owned 0600 environment file with server-only support configuration.
- `/srv/photobooth/shared/`: ingress backups and deployment records.
- `/srv/tedyfazrin/photobooth-ingress/photobooth.conf`: dedicated hostname configuration, readable through the ingress's existing read-only /srv/tedyfazrin mount.
- `/srv/tedyfazrin/photobooth-ingress/tls/`: Photobooth certificate copies, with the private key 0600. This directory is only an ingress bridge, not the application release directory or portfolio root.

The original ingress template and generated active config are backed up before
adding `include /srv/tedyfazrin/photobooth-ingress/*.conf;` inside their http block.
No portfolio location or TLS file is replaced. Persist this include if the bot
release replaces its Nginx template in the future.

## Build and candidate verification

```sh
sha=$(git rev-parse HEAD)
git archive --format=tar.gz -o /tmp/photobooth-$sha.tar.gz "$sha"
scp /tmp/photobooth-$sha.tar.gz root@169.58.68.189:/srv/photobooth/incoming/$sha.tar.gz
ssh root@169.58.68.189 "mkdir -p /srv/photobooth/releases/$sha; tar -xzf /srv/photobooth/incoming/$sha.tar.gz -C /srv/photobooth/releases/$sha; bash /srv/photobooth/releases/$sha/deploy/release.sh $sha"
```

The Docker build uses the committed lockfile, runs type checking, lint,
production dependency auditing, and the production build. Unit and browser tests
run locally/CI against that exact source before activation. The runtime is a
restricted non-root Node container with read-only filesystem, bounded resources
and a Docker health check. There is no public application port. The candidate
starts on loopback. Check its routes, assets, health revision and support
validation before switching the dedicated Nginx upstream.

## Activate

```sh
bash /srv/photobooth/releases/FULL_COMMIT/deploy/activate.sh FULL_COMMIT
```

Activation changes only the dedicated Photobooth config, runs `nginx -t`, reloads
Nginx without recreating the shared ingress, and checks HTTPS health against the
exact revision. Failed checks restore the prior Photobooth config. Existing
containers and source releases remain available.

Public checks after activation: `/api/health` revision, `/`, `/demo`, `/support`,
`/privacy`, `/terms`, CSS/JS and sample assets, camera=(self) permissions policy,
a synthetic camera test, editing/export and malformed support POST. Also check
the portfolio root and its Telegram `/healthz` endpoint. If public checks fail,
restore the previous release before reporting a successful deployment.

## Roll back a later VPS release

```sh
previous=$(cat /srv/photobooth/previous)
sha=${previous#releases/}
bash /srv/photobooth/releases/$sha/deploy/activate.sh "$sha"
```

The previous container/image and source are retained. Activation records the
release being replaced as the next rollback target. Validate `/api/health` after
rollback. Do not delete working release containers as routine cleanup.

## First migration fallback

Before the first cutover, Cloudflare had a DNS-only CNAME `photobooth` pointing to
`cname.vercel-dns.com`, with a one-hour TTL. Preserve the existing Vercel project
and deployments. If the first VPS release fails public checks, restore that
record (CNAME, original target, DNS only) in Cloudflare and verify the Vercel
production deployment. Existing browser gallery data remains under the same
HTTPS origin. The first migration has no older VPS release; do not pretend that
an empty `previous` file is a working rollback target.

## HTTPS renewal

The initial certificate is issued with DNS validation while traffic remains on
Vercel. After DNS cutover, reconfigure that same Certbot certificate to webroot
validation using `/opt/ihsg-bot/shared/acme` (mounted at `/var/www/acme` in the
shared ingress). Run a staging dry run, then use the system's Certbot timer.
The Photobooth renewal deploy hook copies only the Photobooth fullchain/private
key to its dedicated TLS directory, validates Nginx, and reloads the existing
ingress. It must not replace the portfolio/Telegram certificate.

## Secrets

Set the support provider key directly in `/srv/photobooth/shared/runtime.env`.
Keep it out of Git, Docker build arguments, client bundles and logs. Restart or
recreate only the Photobooth container after a runtime secret change, then read
`supportConfigured` from health. Support tests use mocked provider responses.
A malformed production request confirms endpoint validation without sending an
email. A real provider-delivery test requires an explicitly requested message.
