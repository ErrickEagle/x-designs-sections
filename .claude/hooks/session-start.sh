#!/bin/bash
# SessionStart hook: restore the shared Claude skills library.
#
# Copy to <project-repo>/.claude/hooks/session-start.sh, chmod +x, and register
# it in <project-repo>/.claude/settings.json.
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
  git clone --depth 1 --quiet "$SKILLS_REPO" "$CACHE" 2>/dev/null || {
    echo "claude-skills: clone failed (is the repo attached to this session?) — skipping" >&2
    exit 0
  }
fi

if [ -x "$CACHE/install.sh" ]; then
  "$CACHE/install.sh" || echo "claude-skills: install step failed — skipping" >&2
fi

exit 0
