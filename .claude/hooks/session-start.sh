#!/bin/bash
# SessionStart hook: pre-fetch the shared skills library so that installing it
# is instant — but do NOT install it. The user wants to be asked first every
# session; see .claude/CLAUDE.md.
#
# Never fails the session: every failure path exits 0.
set -uo pipefail

# Cloud sessions only — a local machine keeps its own ~/.claude/skills.
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0

SKILLS_REPO="https://github.com/ErrickEagle/claude-skills"
CACHE="${HOME}/.cache/claude-skills"

if [ -d "$CACHE/.git" ]; then
  git -C "$CACHE" pull --ff-only --quiet 2>/dev/null || true
else
  mkdir -p "$(dirname "$CACHE")"
  git clone --depth 1 --quiet "$SKILLS_REPO" "$CACHE" 2>/dev/null \
    || echo "claude-skills: pre-fetch skipped (repo not attached to this session)" >&2
fi

exit 0
