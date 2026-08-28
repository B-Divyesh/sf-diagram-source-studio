#!/bin/sh
set -eu
api="${DIAGRAM_SOURCE_STUDIO_RELEASE_API:-https://api.github.com/repos/B-Divyesh/sf-diagram-source-studio/releases/latest}"
release_json="$(curl -fsSL "$api")"
asset_url="$(printf '%s' "$release_json" | sed -n 's/.*"browser_download_url"[[:space:]]*:[[:space:]]*"\([^"]*\.AppImage\)".*/\1/p' | head -n 1)"
checksum_url="$(printf '%s' "$release_json" | sed -n 's/.*"browser_download_url"[[:space:]]*:[[:space:]]*"\([^"]*SHA256SUMS\)".*/\1/p' | head -n 1)"
if [ -z "$asset_url" ] || [ -z "$checksum_url" ]; then
  echo "Linux downloads are still being published."
  echo "See https://github.com/B-Divyesh/sf-diagram-source-studio/releases"
  exit 1
fi
temp_dir="$(mktemp -d)"
trap 'rm -rf "$temp_dir"' EXIT INT TERM
asset_name="${asset_url##*/}"
curl -fsSL "$asset_url" -o "$temp_dir/$asset_name"
curl -fsSL "$checksum_url" -o "$temp_dir/SHA256SUMS"
expected="$(awk -v file="$asset_name" '{ hash=$1; $1=""; sub(/^ +\*?\.\//, ""); sub(/^ +\*?/, ""); if ($0 == file) print hash }' "$temp_dir/SHA256SUMS")"
actual="$(sha256sum "$temp_dir/$asset_name" | awk '{ print $1 }')"
if [ -z "$expected" ] || [ "$expected" != "$actual" ]; then echo "Checksum verification failed."; exit 1; fi
install_dir="${XDG_BIN_HOME:-$HOME/.local/bin}"
mkdir -p "$install_dir"
install -m 755 "$temp_dir/$asset_name" "$install_dir/diagram-source-studio"
echo "Installed Diagram Source Studio to $install_dir/diagram-source-studio"
