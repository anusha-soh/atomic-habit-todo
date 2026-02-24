---
id: 014
title: Remaining Tasks Audit & HF Deployment Correction
stage: misc
date: 2026-02-24
surface: agent
model: claude-sonnet-4-6
feature: 007-landing-page-update
branch: 007-landing-page-update
user: anusha-soh
command: /sp.analyze (follow-up)
labels: ["deployment", "hugging-face", "constitution-update", "remaining-tasks", "phase-ii"]
links:
  spec: specs/007-landing-page-update/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - .env.example
 - apps/api/.env.example
 - .specify/memory/constitution.md
tests:
 - Read-only analysis for task audit; no tests run
---

## Prompt

okay i am working on spec no 008 except it which phases remaining tasks are left. and we are deploying on hugging face so correct it everywhere

## Response snapshot

Identified 13 remaining incomplete tasks across specs 002, 003, and 007 (excluding 008 which user is actively working on). Corrected all Vercel/Render deployment references to Hugging Face Spaces across 3 files: constitution.md (4 occurrences: Deployment tech, Phase II objectives, Phase II technology section, Submission Requirements), .env.example (CORS comment + NEXT_PUBLIC_API_URL comment), apps/api/.env.example (CORS comment). The API Dockerfile already correctly targets HF Spaces (port 7860) and DEPLOY_HUGGINGFACE.md already existed.

## Outcome

- ✅ Impact: Constitution and env templates now accurately reflect Hugging Face Spaces as the deployment platform. 13 remaining tasks surfaced across 3 specs for user awareness.
- 🧪 Tests: n/a — documentation update
- 📁 Files: 3 files modified (.env.example, apps/api/.env.example, .specify/memory/constitution.md)
- 🔁 Next prompts: Complete spec 008 remaining tasks (T003, T066, T067, T068); tackle spec 003 remaining tasks (T054-T056, T079, T083, T085, T087-T088); complete spec 007 polish tasks (T026-T029).
- 🧠 Reflection: Deployment platform was already HF Spaces in practice (Dockerfile at port 7860, DEPLOY_HUGGINGFACE.md existed) but the constitution and env templates still referenced Vercel/Render. This alignment ensures the constitution accurately reflects actual deployment decisions.

## Evaluation notes (flywheel)

- Failure modes observed: Constitution drift — the authoritative source (constitution.md) was behind actual practice. Deployment docs (DEPLOY_HUGGINGFACE.md) were already correct but the constitution was not updated when the decision was made.
- Graders run and results (PASS/FAIL): File edits applied successfully. No test run needed for documentation correction.
- Prompt variant (if applicable): Follow-up to PHR-013 analysis session
- Next experiment (smallest change to try): Create a vercel.json-equivalent for HF Spaces (Dockerfile already done for API; check if frontend needs a Dockerfile or uses static export + HF SDK).
