#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID="$ROOT/android"
KEYSTORE_NAME="platemyday-upload.keystore"
KEYSTORE_PATH="$ANDROID/$KEYSTORE_NAME"
ALIAS="platemyday"

if [[ -f "$KEYSTORE_PATH" ]]; then
  echo "Already exists: $KEYSTORE_PATH"
  echo "Delete it only if you are sure you will never need that key for Play updates."
  exit 1
fi

KEYTOOL=""
for candidate in \
  "/opt/homebrew/opt/openjdk@21/bin/keytool" \
  "/usr/local/opt/openjdk@21/bin/keytool" \
  "$(command -v keytool 2>/dev/null)"; do
  if [[ -n "$candidate" && -x "$candidate" ]]; then
    KEYTOOL="$candidate"
    break
  fi
done

if [[ -z "$KEYTOOL" ]]; then
  echo "keytool not found. Install JDK 21, e.g.: brew install openjdk@21"
  exit 1
fi

echo "Google Play upload keystore — passwords are hidden as you type."
echo "Use a password manager; you cannot recover this file without the passwords."
read -r -s -p "Keystore password: " STORE_PASS
echo
read -r -s -p "Key password (empty = same as keystore): " KEY_PASS
echo
if [[ -z "${KEY_PASS:-}" ]]; then
  KEY_PASS="$STORE_PASS"
fi

cd "$ANDROID"

"$KEYTOOL" -genkey -v -keystore "$KEYSTORE_NAME" -alias "$ALIAS" \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass "$STORE_PASS" -keypass "$KEY_PASS" \
  -dname "CN=PlateMyDay, OU=Mobile, O=Ravilution, L=Unknown, ST=Unknown, C=US"

umask 077
cat > keystore.properties <<EOF
storePassword=$STORE_PASS
keyPassword=$KEY_PASS
keyAlias=$ALIAS
storeFile=$KEYSTORE_NAME
EOF

echo "Created:"
echo "  $KEYSTORE_PATH"
echo "  $ANDROID/keystore.properties (gitignored)"
echo ""
echo "Next: bun run android:bundle"
echo "Upload: android/app/build/outputs/bundle/release/app-release.aab"
