---
id: 002
title: Deployment CI/CD Spec Clarification
stage: spec
date: 2026-02-24
surface: agent
model: claude-opus-4-6
feature: 009-deployment-cicd-pipeline
branch: 009-deployment-cicd-pipeline
user: HP
command: /sp.clarify
labels: ["spec", "clarification", "cicd", "e2e", "rollback", "hugging-face", "github-actions"]
links:
  spec: specs/009-deployment-cicd-pipeline/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/009-deployment-cicd-pipeline/spec.md
tests:
  - null
---

## Prompt

/sp.clarify

## Response snapshot

Ran structured ambiguity scan across 11 taxonomy categories. Found 2 meaningful ambiguities requiring clarification:

**Q1: CI test levels** — Spec had contradictory FR-007 (unit tests using PG service) vs FR-001 (unit tests need no DB). User chose Option C: full test pyramid (unit + integration + E2E via Playwright). Updated FR-007, added FR-010 for E2E, expanded time budget to 15 minutes.

**Q2: Rollback strategy** — No rollback process defined for failed backend deployments. User chose Option A (git revert) AND clarified the deployment model: GitHub is the single source of truth, GitHub Actions auto-syncs `apps/api/` to HF Spaces after CI passes. Updated US4 from manual deployment to fully automated CI-gated flow. Added FR-017 (auto-sync), FR-018-A (HF_TOKEN secret), FR-019-A (rollback via revert).

## Outcome

- ✅ Impact: Spec upgraded from 20 to 22 FRs; US4 changed from manual to automated deployment; CI scope expanded to full test pyramid
- 🧪 Tests: No tests (clarification phase)
- 📁 Files: specs/009-deployment-cicd-pipeline/spec.md (updated with clarifications section + FR/US changes)
- 🔁 Next prompts: `/sp.plan` to create the architecture plan
- 🧠 Reflection: User's clarification on Q2 revealed a significantly better architecture than what was spec'd — automated GitHub→HF sync via Actions is more professional than the "manual with documentation" approach originally written.

## Evaluation notes (flywheel)

- Failure modes observed: FR-007 originally contradicted FR-001 (unit tests needing PG service vs no DB). Caught during ambiguity scan.
- Graders run and results (PASS/FAIL): Not run
- Prompt variant (if applicable): null
- Next experiment: null
