#!/usr/bin/env bash
set -Eeuo pipefail
[ "${RENEWED_LINEAGE:-}" = /etc/letsencrypt/live/photobooth.tedyfazrin.com ] || exit 0
root=/srv/tedyfazrin/photobooth-ingress/tls
cp "$RENEWED_LINEAGE/fullchain.pem" "$root/fullchain.pem"
install -m 0600 "$RENEWED_LINEAGE/privkey.pem" "$root/privkey.pem"
docker exec ihsg-bot-ingress-1 nginx -c /tmp/nginx.conf -t
docker exec ihsg-bot-ingress-1 nginx -c /tmp/nginx.conf -s reload
