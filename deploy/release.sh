#!/usr/bin/env bash
set -Eeuo pipefail
# Run on the VPS after uploading the Git archive to incoming/<commit>.tar.gz.
sha=${1:?Pass the full release commit}
[[ $sha =~ ^[0-9a-f]{40}$ ]] || exit 2
root=/srv/photobooth
release=$root/releases/$sha
name=photobooth-${sha:0:12}
mkdir -p "$root/releases" "$root/incoming"
if [ ! -d "$release" ]; then
  mkdir "$release"
  tar -xzf "$root/incoming/$sha.tar.gz" -C "$release" --no-same-owner
fi
docker build -f "$release/deploy/Dockerfile" -t "photobooth:$sha" "$release"
if ! docker inspect "$name" >/dev/null 2>&1; then
  docker run -d --name "$name" --restart unless-stopped \
    --env-file "$root/shared/runtime.env" -e RELEASE_SHA="$sha" \
    --memory 384m --cpus 1 --cap-drop ALL --security-opt no-new-privileges \
    --read-only --tmpfs /tmp:rw,noexec,nosuid,size=32m \
    -p 127.0.0.1::3000 "photobooth:$sha"
fi
port=$(docker inspect "$name" --format '{{(index (index .NetworkSettings.Ports "3000/tcp") 0).HostPort}}')
for attempt in {1..20}; do
  if curl -fsS "http://127.0.0.1:$port/api/health" | python3 -c 'import json,sys; assert json.load(sys.stdin)["revision"] == sys.argv[1]' "$sha"; then break; fi
  sleep 1
done
curl -fsS "http://127.0.0.1:$port/api/health" | python3 -c 'import json,sys; assert json.load(sys.stdin)["revision"] == sys.argv[1]' "$sha"
for route in / /demo /support /privacy /terms /logo.svg /samples/01.jpg; do curl -fsS "http://127.0.0.1:$port$route" >/dev/null; done
printf '%s\n' "$port" > "$release/port"
printf '%s\n' "$name" > "$release/container"
printf 'Candidate %s ready on 127.0.0.1:%s\n' "$sha" "$port"
