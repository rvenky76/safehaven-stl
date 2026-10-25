#!/usr/bin/env bash
# build-apk.sh — build an installable Android APK for SafeHaven STL via EAS.
# Produces a sideloadable .apk (preview profile).
#
# Usage:  ./build-apk.sh
set -euo pipefail

PROJECT_DIR="/Users/tvxr2/projects/safehaven-stl"
NODE20_BIN="/opt/homebrew/opt/node@20/bin"

if [ -x "$NODE20_BIN/node" ]; then
  export PATH="$NODE20_BIN:$PATH"
fi
echo "Using Node $(node -v)"
cd "$PROJECT_DIR"

# Prefer a globally-installed eas (NOT a project dep — a local eas-cli drags in
# an incompatible @expo/config-plugins that breaks the Gradle build).
if command -v eas >/dev/null 2>&1; then
  EAS="eas"
else
  echo "No global eas found. Install with:  npm install -g eas-cli"
  EAS="npx --yes eas-cli"
fi
echo "Using eas: $($EAS --version 2>/dev/null | tail -1)"

if $EAS whoami >/dev/null 2>&1; then
  echo "Logged in to Expo as: $($EAS whoami)"
else
  echo "Logging in to Expo (free account at https://expo.dev)..."
  $EAS login
fi

$EAS init
echo "Submitting Android APK build (preview profile)..."
$EAS build --platform android --profile preview

echo
echo "When the build finishes, open the build URL / scan the QR on your Android"
echo "phone, download the .apk, and tap to install (allow 'unknown sources')."
