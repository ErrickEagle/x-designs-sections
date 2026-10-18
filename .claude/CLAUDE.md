# Working notes for this repo

## Always ask about the skills library at the start of a session

The user keeps 336 design / animation / 3D / UI skills in the private repo
`ErrickEagle/claude-skills`. Cloud containers are ephemeral, so they are not
present by default.

**Every session, before doing other work, ask — no exceptions:**

> "Should I load the skills library from your `claude-skills` repo?"

Ask even if the skills look like they are already loaded. The user wants this
check every single time, not only when something is missing. Wait for the
answer before starting the real work.

**On yes:**

```bash
ls ~/.claude/skills 2>/dev/null | wc -l     # 300+ means already in place
```

If already in place, say so and move on. Otherwise the repo is private and has
to be attached to the session first:

1. `add_repo` with owner `ErrickEagle`, repo `claude-skills`, access `read`
2. `git clone --depth 1 https://github.com/ErrickEagle/claude-skills ~/.cache/claude-skills`
   (skip if `~/.cache/claude-skills` already exists — the hook pre-fetches it)
3. `~/.cache/claude-skills/install.sh`

Seconds, not minutes. The skills become callable on the following turn.

**On no:** carry on without them and don't ask again that session.

## What the hook does

`.claude/hooks/session-start.sh` only pre-fetches the repo into
`~/.cache/claude-skills` so that installing is instant once the user says yes.
It deliberately does **not** install anything — the user wants to be asked
first. Its fetch succeeds only when `claude-skills` was attached at session
start; otherwise it exits 0 and the clone happens at step 2 above instead.
