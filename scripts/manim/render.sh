#!/usr/bin/env bash
# Renders the chalkboard math clips (scripts/manim/clips.py) to public/manim/*.mp4
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CLIPS="$SCRIPT_DIR/clips.py"
OUT_DIR="$PROJECT_ROOT/public/manim"

if ! command -v manim >/dev/null 2>&1; then
  echo "error: manim not found on PATH (install with: uv tool install manim)" >&2
  exit 1
fi

MEDIA_DIR="$(mktemp -d "${TMPDIR:-/tmp}/math140-manim.XXXXXX")"
trap 'rm -rf "$MEDIA_DIR"' EXIT
mkdir -p "$OUT_DIR"

SCENES=(
  "Construction:construction"
  "AngleProof:angle_proof"
  "TriangleArea:triangle_area"
  "NumberLineCheck:number_line_check"
)

for entry in "${SCENES[@]}"; do
  cls="${entry%%:*}"
  name="${entry##*:}"
  echo "==> Rendering $cls -> $name.mp4"
  manim -r 1280,720 --fps 30 --format mp4 --disable_caching -v WARNING \
    --media_dir "$MEDIA_DIR" -o "$name.mp4" "$CLIPS" "$cls"
  out="$(find "$MEDIA_DIR/videos" -type f -name "$name.mp4" -not -path '*partial_movie_files*' | head -n 1)"
  if [[ -z "$out" ]]; then
    echo "error: could not find rendered $name.mp4" >&2
    exit 1
  fi
  cp "$out" "$OUT_DIR/$name.mp4"
  echo "    -> public/manim/$name.mp4"
done

echo "Done. Clips written to $OUT_DIR"
