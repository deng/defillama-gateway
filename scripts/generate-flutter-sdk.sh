#!/bin/bash
# Regenerate Flutter SDK from the live OpenAPI spec
# Usage: ./scripts/generate-flutter-sdk.sh [spec-url]

set -euo pipefail

SPEC_URL="${1:-https://defillama.bithub.pro/api/v1/openapi.json}"
OUTPUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/defillama-gateway-flutter"

echo "=== Regenerating Flutter SDK ==="
echo "  Spec URL: $SPEC_URL"
echo "  Output:   $OUTPUT_DIR"
echo ""

GENERATOR_CMD=""
if command -v openapi-generator > /dev/null 2>&1; then
  GENERATOR_CMD="openapi-generator"
elif command -v openapi-generator-cli > /dev/null 2>&1; then
  GENERATOR_CMD="openapi-generator-cli"
fi

if [[ -z "$GENERATOR_CMD" ]]; then
  echo "Error: OpenAPI generator CLI not found. Install one of:"
  echo "  brew install openapi-generator"
  echo "  # or"
  echo "  npm install @openapitools/openapi-generator-cli -g"
  exit 1
fi

rm -rf "$OUTPUT_DIR"

"$GENERATOR_CMD" generate \
  -i "$SPEC_URL" \
  -g dart \
  -o "$OUTPUT_DIR" \
  --additional-properties=\
pubName=defillama_gateway,\
pubVersion=1.0.0,\
pubDescription="ZeroWallet DefiLlama Gateway API client for Flutter",\
useJsonKey=true,\
sortParamsByRequiredFlag=true

perl -0pi -e "s/homepage: 'homepage'/homepage: 'https:\/\/github.com\/deng\/defillama-gateway'/" "$OUTPUT_DIR/pubspec.yaml"
perl -0pi -e "s/sdk: '>=2\.12\.0 <4\.0\.0'/sdk: '>=2.18.0 <4.0.0'/" "$OUTPUT_DIR/pubspec.yaml"
perl -0pi -e "s/Dart 2\.12 or later/Dart 2.18 or later/; s/Github/GitHub/g; s#https:\/\/github.com\/GIT_USER_ID\/GIT_REPO_ID\.git#https://github.com/deng/defillama-gateway.git#" "$OUTPUT_DIR/README.md"
perl -0pi -e "s/- \"2\.12\"/- \"2.18\"/" "$OUTPUT_DIR/.travis.yml"

echo ""
echo "=== Done ==="
echo "Generated $(find "$OUTPUT_DIR/lib" -name '*.dart' | wc -l | xargs) Dart files"
echo "Generated $(find "$OUTPUT_DIR/test" -name '*.dart' | wc -l | xargs) test files"
echo "Generated $(find "$OUTPUT_DIR/doc" -name '*.md' | wc -l | xargs) doc files"