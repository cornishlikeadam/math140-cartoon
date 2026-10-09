#!/usr/bin/env bash
set -euo pipefail

mkdir -p out/previews

echo "==> Rendering keyframe preview stills for each scene..."
npx remotion still Scene1 out/previews/scene1.png --frame=225 --overwrite
npx remotion still Scene2 out/previews/scene2.png --frame=450 --overwrite
npx remotion still Scene3 out/previews/scene3.png --frame=300 --overwrite
npx remotion still Scene4 out/previews/scene4.png --frame=350 --overwrite
npx remotion still Scene5 out/previews/scene5.png --frame=300 --overwrite
npx remotion still Scene6 out/previews/scene6.png --frame=225 --overwrite

echo "✔ All 6 scene preview stills rendered in out/previews/"
