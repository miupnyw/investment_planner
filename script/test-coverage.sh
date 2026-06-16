#!/usr/bin/env bash
# Usage:
#   ./scripts/test-coverage.sh                          # run all tests with coverage
#   ./scripts/test-coverage.sh src/modules/directory    # run coverage for all tests in a directory
#   ./scripts/test-coverage.sh src/path/to/file.ts      # run coverage for a single source or test file

set -euo pipefail

export TZ=Asia/Bangkok

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ $# -eq 0 ]; then
  echo "Running full test suite with coverage..."
  npx jest --coverage --coverageReporters=text --coverageReporters=text-summary
  exit 0
fi

INPUT="$1"

# Strip leading ./ if present
INPUT="${INPUT#./}"

# Handle directory input
if [ -d "$ROOT/$INPUT" ]; then
  echo "Directory : $INPUT"
  echo ""
  npx jest "$INPUT" \
    --coverage \
    --collectCoverageFrom="[\"$INPUT/**/*.{ts,tsx}\",\"!$INPUT/**/*.test.{ts,tsx}\",\"!$INPUT/**/*.d.ts\"]" \
    --coverageReporters=text \
    --coverageReporters=text-summary
  exit 0
fi

# Accept both source file and test file as input
if [[ "$INPUT" == *.test.ts || "$INPUT" == *.test.tsx ]]; then
  TEST_FILE="$INPUT"
  # Derive source file by removing .test from the name
  SOURCE_FILE="${INPUT/.test.ts/.ts}"
  SOURCE_FILE="${SOURCE_FILE/.test.tsx/.tsx}"
else
  # Re-derive: replace last .ts/.tsx with .test.ts/.test.tsx
  EXT="${INPUT##*.}"
  BASE="${INPUT%.*}"
  TEST_FILE="${BASE}.test.${EXT}"
  SOURCE_FILE="$INPUT"
fi

if [ ! -f "$ROOT/$TEST_FILE" ]; then
  echo "Error: test file not found: $TEST_FILE"
  echo "Expected test file alongside source file."
  exit 1
fi

if [ ! -f "$ROOT/$SOURCE_FILE" ]; then
  echo "Warning: source file not found: $SOURCE_FILE (coverage scope will be skipped)"
  npx jest "$TEST_FILE" --coverage --coverageReporters=text --coverageReporters=text-summary
  exit 0
fi

echo "Source : $SOURCE_FILE"
echo "Test   : $TEST_FILE"
echo ""

npx jest "$TEST_FILE" \
  --coverage \
  --collectCoverageFrom="[\"$SOURCE_FILE\"]" \
  --coverageReporters=text \
  --coverageReporters=text-summary
