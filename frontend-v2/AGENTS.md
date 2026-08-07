<!-- intent-skills:start -->
## Skill Loading

Before editing files for a substantial task:
- Run `pnpm dlx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpm dlx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

# Project agent notes

Wakana is an open-source, self-hosted WakaTime alternative.

The repo is split into a Go backend at the root and two frontend codebases:

- `frontend-v2/` is the active TanStack Start rewrite. All new frontend features should go here.
- `frontend/` is the legacy Next.js app. Treat it as maintenance-only unless you are explicitly working on legacy code.

Backend layout:

- `internal/api/` — HTTP handlers, route wiring, and API endpoints.
- `internal/jobs/`, `internal/mail/`, `internal/observability/`, `internal/utilities/` — backend support code.
- `services/`, `repositories/`, `models/` — domain logic, persistence, and shared data types; some older code still lives here, but new backend work is generally organized under `internal/`.
- `cmd/` — CLI entrypoints and server commands.
- `migrations/` — database migrations.

Useful supporting areas:

- `routes/` and `middlewares/` — legacy/edge request handling pieces.
- `config/` — app configuration and defaults.
- `static/` and `frontend/public/` — static assets.


