#!/usr/bin/env bash
set -euo pipefail
mkdir -p public/fonts
css=$(curl -s -A "Mozilla/5.0" --max-time 20 "https://api.fontshare.com/v2/css?f[]=clash-display@500,600&f[]=general-sans@400,500,600&display=swap")
# Fontshare's CSS returns protocol-relative URLs (//cdn.fontshare.com/...), not
# absolute https:// ones, so match both and normalize to https:// before fetching.
echo "$css" | grep -oE '(https:)?//[^)]+\.woff2' | sort -u | while read -r url; do
  case "$url" in
    //*) url="https:$url" ;;
  esac
  curl -s -A "Mozilla/5.0" --max-time 20 "$url" -o "public/fonts/$(basename "$url")"
done
# JetBrains Mono (Regular, Medium) из официального репозитория
for w in Regular Medium; do
  curl -sL "https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/webfonts/JetBrainsMono-$w.woff2" \
    -o "public/fonts/JetBrainsMono-$w.woff2"
done
ls -la public/fonts
