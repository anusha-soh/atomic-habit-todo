---
id: PHR-001
title: Preflight Validation Skill Creation
stage: misc
date: 2026-01-05
surface: agent
model: claude-opus-4-5-20251101
feature: general
branch: 002-phase2-chunk2
user: HP
command: conversation
labels: ["skill", "validation", "preflight", "error-prevention", "tooling"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .claude/commands/sp.preflight.md
  - .claude/commands/sp.implement.md
  - .specify/scripts/python/preflight_validator.py
  - CLAUDE.md
tests:
  - Manual test: preflight_validator.py --ascii (PASS with warnings)
  - Manual test: preflight_validator.py --json (PASS)
---

## Prompt

okay i have a question. what errors did you face and how can we avoid them in future? what code structure do you think will help in future sessions that you have to keep going through code base to read. basically i wanna know if there is skill we could made to avoid errors and maintain code.

yes create this skill and make it auto run before implementation to maintain consistency and avoid error and making same mistakes.

## Response snapshot

Created a comprehensive preflight validation system to catch common implementation errors BEFORE they occur:

**1. `/sp.preflight` Skill** (`.claude/commands/sp.preflight.md`)
- Standalone skill for validation checks
- Can be run manually: `/sp.preflight`
- Checks: SQLModel fields, imports, database compatibility, TDD placeholders, environment

**2. Python Validator Script** (`.specify/scripts/python/preflight_validator.py`)
- Automated validation with detailed reporting
- Supports: `--auto-fix`, `--json`, `--ascii` flags
- Exit code 1 on critical failures (blocks CI/CD)
- Exit code 0 on pass/warnings

**3. Updated `/sp.implement`**
- Added Step 0: Preflight Validation (auto-runs before implementation)
- Blocks implementation if CRITICAL issues found
- Allows proceed with WARNINGS

**4. Updated `CLAUDE.md`**
- Added "Common Pitfalls - MUST READ BEFORE IMPLEMENTATION" section
- Documents all known issues with code examples
- Provides rules for each pitfall

**Errors Addressed:**
1. SQLModel Field + sa_column conflicts → RuntimeError
2. Missing `src.` prefix in imports → ModuleNotFoundError
3. PostgreSQL ARRAY with SQLite tests → UnsupportedCompilationError
4. TDD placeholder tests → always failing tests

## Outcome

- Impact: Future implementation sessions will catch errors BEFORE writing code, saving debug time
- Tests: Preflight validator tested with --ascii and --json flags (PASS)
- Files: 4 files created/modified
- Next prompts: Run `/sp.preflight` before any implementation, extend validator for new error patterns
- Reflection: Documenting errors and creating automated checks prevents repeating mistakes

## Evaluation notes (flywheel)

- Failure modes observed: Encoding issues with Unicode characters on Windows cmd
- Graders run and results (PASS/FAIL): Manual test PASS
- Prompt variant (if applicable): N/A
- Next experiment: Add more validation rules as new error patterns are discovered
