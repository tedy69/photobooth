#!/usr/bin/env bash
set -Eeuo pipefail
sha=${1:?Pass the full validated release commit}
[[ $sha =~ ^[0-9a-f]{40}$ ]] || exit 2
root=/srv/photobooth
release=$root/releases/$sha
name=$(cat "$release/container")
port=$(cat "$release/port")
[[ $port =~ ^[0-9]+$ ]] || exit 2
config=/srv/tedyfazrin/photobooth-ingress/photobooth.conf
previous=$(readlink "$root/current" || true)
if [ "$previous" = "releases/$sha" ]; then
  curl -fsS --resolve photobooth.tedyfazrin.com:443:127.0.0.1 https://photobooth.tedyfazrin.com/api/health | python3 -c 'import json,sys; assert json.load(sys.stdin)["revision"] == sys.argv[1]' "$sha"
  echo 'This release is already active and healthy.'
  exit 0
fi
backup=$root/shared/photobooth.conf.before-$sha
cp "$config" "$backup"
# Dedicated gateway listener makes the app reachable only through the existing ingress network.
# Recreate only this candidate with a private ingress-gateway binding, preserving all other services.
docker rm -f "$name" >/dev/null
docker run -d --name "$name" --restart unless-stopped --env-file "$root/shared/runtime.env" \
  -e RELEASE_SHA="$sha" --memory 384m --cpus 1 --cap-drop ALL --security-opt no-new-privileges \
  --read-only --tmpfs /tmp:rw,noexec,nosuid,size=32m -p "172.18.0.1:$port:3000" "photobooth:$sha" >/dev/null
for attempt in {1..20}; do curl -fsS "http://172.18.0.1:$port/api/health" >/dev/null && break; sleep 1; done
curl -fsS "http://172.18.0.1:$port/api/health" | python3 -c 'import json,sys; assert json.load(sys.stdin)["revision"] == sys.argv[1]' "$sha"
sed "s|http://172.18.0.1:3030|http://172.18.0.1:$port|g" "$release/deploy/photobooth.conf" > "$config.next"
mv "$config.next" "$config"
rollback() {
  cp "$backup" "$config"
  docker exec ihsg-bot-ingress-1 nginx -c /tmp/nginx.conf -t
  docker exec ihsg-bot-ingress-1 nginx -c /tmp/nginx.conf -s reload
  echo 'Photobooth configuration restored.' >&2
}
if ! docker exec ihsg-bot-ingress-1 nginx -c /tmp/nginx.conf -t; then rollback; exit 1; fi
docker exec ihsg-bot-ingress-1 nginx -c /tmp/nginx.conf -s reload
healthy=false
for attempt in {1..15}; do
  if curl -fsS --resolve photobooth.tedyfazrin.com:443:127.0.0.1 https://photobooth.tedyfazrin.com/api/health | python3 -c 'import json,sys; assert json.load(sys.stdin)["revision"] == sys.argv[1]' "$sha"; then
    healthy=true
    break
  fi
  sleep 1
done
if [ "$healthy" != true ]; then rollback; exit 1; fi
ln -sfn "releases/$sha" "$root/current.next"
mv -Tf "$root/current.next" "$root/current"
[ -z "$previous" ] || printf '%s\n' "$previous" > "$root/previous"
printf 'Activated %s (previous: %s)\n' "$sha" "$previous"
