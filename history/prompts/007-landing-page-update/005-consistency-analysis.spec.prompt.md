---
id: 005
title: Cross-artifact consistency analysis for landing page update
stage: spec
date: 2026-02-15
surface: agent
model: Gemini 2.0 Flash
feature: 007-landing-page-update
branch: 007-landing-page-update
user: HP
command: /sp.analyze
labels: ["analysis", "consistency", "quality"]
links:
  spec: specs/007-landing-page-update/spec.md
  plan: specs/007-landing-page-update/plan.md
  tasks: specs/007-landing-page-update/tasks.md
files: []
tests: []
---

## Prompt

---
description: Perform a non-destructive cross-artifact consistency and quality analysis across spec.md, plan.md, and tasks.md after task generation.
---

## User Input

```text
$ARGUMENTS
```

... (rest of the prompt template used for sp.analyze)

## Response snapshot

Performed a cross-artifact analysis and identified 5 findings. Key issues include missing explicit test creation tasks (despite being in the technical plan) and a lack of dedicated performance measurement for the FCP target. Coverage is high at 92%.

## Outcome

- ✅ Impact: Identified gaps in testing and performance verification before implementation.
- 🧪 Tests: N/A (Read-only analysis).
- 📁 Files: None modified.
- 🔁 Next prompts: /sp.implement
- 🧠 Reflection: The semantic mapping successfully caught the discrepancy between the plan's testing tools and the tasks' actual steps.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
