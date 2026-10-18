# Working notes for this repo

## Shared skills library — say something at the start of every session

The user keeps 336 design / animation / 3D / UI skills in the private repo
`ErrickEagle/claude-skills`. Cloud containers are ephemeral, so those skills are
gone at the start of each new session unless they are restored.

**Before doing other work, check and report:**

```bash
ls ~/.claude/skills 2>/dev/null | wc -l     # 300+ means already loaded
```

- **Already loaded** (the SessionStart hook managed it) — say so in one line and
  carry on. Don't ask.
- **Not loaded** — ask the user: *"Would you like me to load the skills library
  (336 design / animation / 3D skills)?"* Wait for an answer. Never load it
  unannounced, and never silently work without it.

**On yes** — the repo is private, so it must be attached to this session first:

1. `add_repo` with owner `ErrickEagle`, repo `claude-skills`, access `read`
2. `git clone --depth 1 https://github.com/ErrickEagle/claude-skills ~/.cache/claude-skills`
3. `~/.cache/claude-skills/install.sh`

Takes about 6 seconds. The skills become callable on the following turn.

**On no** — carry on without them and don't ask again this session.

## Why the hook sometimes doesn't cover it

`.claude/hooks/session-start.sh` runs all of the above automatically, but its
clone only succeeds when `claude-skills` was attached at session start. When the
user starts a session on this repo alone, the hook exits 0 without doing
anything — which is the case the question above is for.
