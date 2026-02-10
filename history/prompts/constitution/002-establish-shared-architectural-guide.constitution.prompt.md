---
id: 002
title: Establish shared architectural guide and patterns
stage: constitution
date: 2026-02-09
surface: agent
model: gemini-2.0-flash-thinking-exp
feature: none
branch: 002-phase2-chunk2
user: anusha-soh
command: /sp.phr
labels: ["architecture", "standards", "sdd", "consistency"]
links:
  spec: specs/000-shared/ARCHITECT_GUIDE.md
  ticket: null
  adr: null
  pr: null
files:
  - GEMINI.md
  - specs/000-shared/ARCHITECT_GUIDE.md
  - specs/000-shared/backend-patterns.md
  - specs/000-shared/frontend-patterns.md
  - specs/000-shared/testing-patterns.md
tests:
  - none
---

## Prompt

when implementing chunk 3 - habits, what in consistancies may uccure if an agent start builing it with only specs without seing code base. like shemas etc
how about you create a skill specific to this code base where in refrence files to provide all the schemas and stuff so the agnet can use it. add refrence to files and code snipits and schemas and anything that would be usefull. just dont hard code paths from drive and stuff.
reference it in gemini.md so thet you knoe it
also it will be improve over time

## Response snapshot

Identified risks of architectural drift (UUIDs, user isolation, hydration mismatches) when building from specs alone. Created a specialized architectural guide in `specs/000-shared/` containing backend, frontend, and testing patterns. Updated `GEMINI.md` to mandate referencing these patterns, ensuring they serve as a living document that improves over time.

## Outcome

- ✅ Impact: Established a "living" architectural bridge to prevent inconsistency in future features.
- 🧪 Tests: none
- 📁 Files: Created specs/000-shared/ directory and guides; Updated GEMINI.md.
- 🔁 Next prompts: Use these patterns to analyze and implement Phase 2 Chunk 3 (Habits).
- 🧠 Reflection: Capturing "tribal knowledge" into explicit specs prevents the most common failures in multi-agent or multi-session SDD.

## Evaluation notes (flywheel)

- Failure modes observed: `gemini skills install` failed due to Windows path validation issues; pivoted to shared spec files which are more portable.
- Graders run and results (PASS/FAIL): PASS (GEMINI.md updated).
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Periodically review and update ARCHITECT_GUIDE.md after each major chunk.
