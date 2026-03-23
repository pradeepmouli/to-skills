#!/usr/bin/env bash
set -uo pipefail

# Bootstrap spec-kit: init for claude + copilot, install all extensions
# Usage: ./scripts/bootstrap-speckit.sh
#
# Idempotent — safe to run multiple times. Removes and reinstalls extensions.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "=== Bootstrapping spec-kit in $(basename "$PROJECT_DIR") ==="

# 1. Init for Claude + Copilot with skills
echo ""
echo "--- Step 1: specify init --ai claude --ai-skills ---"
specify init --here --force --ai claude --ai-skills

echo ""
echo "--- Step 2: specify init --ai copilot --ai-skills ---"
specify init --here --force --ai copilot --ai-skills

# 2. Install workflow extensions (from spec-kit-extensions)
echo ""
echo "--- Step 3: specify-extend --all ---"
printf 'y\n' | specify extension remove workflows 2>/dev/null || true
printf 'all\n' | specify-extend --all --hooks --github-integration || true

# 3. Install community extensions via --from with tagged release zips
echo ""
echo "--- Step 4: Installing verify, review, sync, doctor extensions ---"

declare -A EXT_URLS=(
  [verify]="https://github.com/ismaelJimenez/spec-kit-verify/archive/refs/tags/v1.0.0.zip"
  [review]="https://github.com/ismaelJimenez/spec-kit-review/archive/refs/tags/v1.0.0.zip"
  [sync]="https://github.com/bgervin/spec-kit-sync/archive/refs/tags/v0.1.0.zip"
  [doctor]="https://github.com/KhawarHabibKhan/spec-kit-doctor/archive/refs/tags/v1.0.0.zip"
)

for ext in verify review sync doctor; do
  echo "  Installing $ext..."
  printf 'y\n' | specify extension remove "$ext" 2>/dev/null || true
  specify extension add "$ext" --from "${EXT_URLS[$ext]}" || echo "  Warning: $ext installation failed"
done

# 4. Verify
echo ""
echo "--- Step 5: Verify installation ---"
specify extension list

echo ""
echo "=== Done! ==="
