---
id: 004
title: Generate tasks for landing page update
stage: tasks
date: 2026-02-15
surface: agent
model: Gemini 2.0 Flash
feature: 007-landing-page-update
branch: 007-landing-page-update
user: HP
command: /sp.tasks
labels: ["tasks", "landing-page", "planning"]
links:
  spec: specs/007-landing-page-update/spec.md
  plan: specs/007-landing-page-update/plan.md
  tasks: specs/007-landing-page-update/tasks.md
files:
  - specs/007-landing-page-update/tasks.md
tests:
  - Task format validation passed
---

## Prompt

---
description: Generate an actionable, dependency-ordered tasks.md for the feature based on available design artifacts.
handoffs: 
  - label: Analyze For Consistency
    agent: sp.analyze
    prompt: Run a project analysis for consistency
    send: true
  - label: Implement Project
    agent: sp.implement
    prompt: Start the implementation in phases
    send: true
---

## User Input

```text
$ARGUMENTS
```

... (rest of the prompt template used for sp.tasks)

## Response snapshot

Generated a dependency-ordered `tasks.md` file for the Landing Page Modernization feature. The tasks are organized by user story (US1-US4) and follow the strict checklist format. Identified parallelization opportunities for component development.

## Outcome

- ✅ Impact: Executable roadmap created for the landing page update.
- 📁 Files: Created specs/007-landing-page-update/tasks.md.
- 🔁 Next prompts: /sp.analyze or /sp.implement
- 🧠 Reflection: Organizing tasks by user story ensures that each phase results in a testable increment of the product.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
