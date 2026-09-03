#!/usr/bin/env bash
# Subsets the self-hosted JetBrains Mono to the glyphs this site can actually
# render: Basic Latin, Latin-1, Latin Extended-A (ă â î), the comma-below
# forms ș ț Ș Ț (U+0218–021B), general punctuation (dashes, quotes, …), € ™,
# arrows and ✓. (MonoLabel's scramble also draws ▮ U+25AE, which JetBrains
# Mono doesn't contain at all — that glyph always came from the system
# fallback font.) Layout features are cut to kerning + composition: the
# programming ligatures (`->`, `==`, …) alone drag ~150 extra glyphs in and
# never appear in a label. The full webfont is ~92 KB per weight (Cyrillic,
# Greek, box drawing, every ligature variant); this subset is ~20 KB.
# tests/fonts.test.ts enforces a 40 KB budget per file so an unsubsetted
# re-download can't ship.
#
# Clash Display / General Sans come from Fontshare already subset to Latin;
# they are left alone.
#
# Needs fontTools with WOFF2 support (`pip install fonttools brotli`;
# `pyftsubset` is fontTools' CLI). Run from the repo root, after
# scripts/fetch-fonts.sh — which calls this itself.
set -euo pipefail

UNICODES="U+0020-007E,U+00A0-00FF,U+0100-017F,U+0218-021B,U+2000-206F,U+20AC,U+2122,U+2190-2199,U+2713"
FEATURES="kern,ccmp,locl,mark,mkmk"

for f in public/fonts/JetBrainsMono-*.woff2; do
  tmp="${f%.woff2}.subset.woff2"
  pyftsubset "$f" --output-file="$tmp" --flavor=woff2 --unicodes="$UNICODES" --layout-features="$FEATURES"
  mv "$tmp" "$f"
  printf '%s: %s bytes\n' "$f" "$(wc -c <"$f" | tr -d ' ')"
done
