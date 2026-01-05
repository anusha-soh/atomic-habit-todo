#!/usr/bin/env python3
"""
Preflight Validator for SDD Implementation
==========================================

Validates codebase for common issues before implementation begins.

Checks:
1. SQLModel field definitions (nullable + sa_column conflicts)
2. Import path consistency (missing src. prefix)
3. Database compatibility (PostgreSQL vs SQLite)
4. TDD placeholder detection
5. Environment configuration

Usage:
    python preflight_validator.py --feature-dir specs/002-phase2-chunk2
    python preflight_validator.py --auto-fix
    python preflight_validator.py --json
"""

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional, Tuple
from datetime import datetime


@dataclass
class Issue:
    """Represents a validation issue"""
    severity: str  # CRITICAL, WARNING, INFO
    category: str  # SQLMODEL, IMPORT, DATABASE, TDD, ENV
    file_path: str
    line_number: int
    message: str
    suggestion: str
    auto_fixable: bool = False
    fix_pattern: Optional[Tuple[str, str]] = None  # (find, replace)


@dataclass
class ValidationResult:
    """Results from a validation check"""
    name: str
    status: str  # PASS, FAIL, WARN
    issues: List[Issue] = field(default_factory=list)

    @property
    def passed(self) -> bool:
        return self.status == "PASS"

    @property
    def critical_count(self) -> int:
        return len([i for i in self.issues if i.severity == "CRITICAL"])

    @property
    def warning_count(self) -> int:
        return len([i for i in self.issues if i.severity == "WARNING"])


class PreflightValidator:
    """Main validator class"""

    def __init__(self, project_root: Path, feature_dir: Optional[Path] = None):
        self.project_root = project_root
        self.feature_dir = feature_dir
        self.results: List[ValidationResult] = []

    def validate_all(self) -> List[ValidationResult]:
        """Run all validation checks"""
        self.results = [
            self.check_sqlmodel_fields(),
            self.check_import_consistency(),
            self.check_database_compatibility(),
            self.check_tdd_placeholders(),
            self.check_environment_config(),
        ]
        return self.results

    def check_sqlmodel_fields(self) -> ValidationResult:
        """Check for SQLModel Field definition issues"""
        result = ValidationResult(name="SQLModel Fields", status="PASS")

        models_dir = self.project_root / "apps" / "api" / "src" / "models"
        if not models_dir.exists():
            return result

        # Patterns that indicate problematic Field definitions
        bad_patterns = [
            # nullable with sa_column
            (r'Field\s*\([^)]*nullable\s*=\s*[^,)]+[^)]*sa_column\s*=',
             "Don't use 'nullable' with 'sa_column'. Put nullable inside Column()."),
            # max_length with sa_column
            (r'Field\s*\([^)]*max_length\s*=\s*[^,)]+[^)]*sa_column\s*=',
             "Don't use 'max_length' with 'sa_column'. Use Column constraints instead."),
        ]

        for py_file in models_dir.glob("*.py"):
            content = py_file.read_text(encoding="utf-8")
            lines = content.split("\n")

            for line_num, line in enumerate(lines, 1):
                for pattern, suggestion in bad_patterns:
                    if re.search(pattern, line):
                        result.issues.append(Issue(
                            severity="CRITICAL",
                            category="SQLMODEL",
                            file_path=str(py_file.relative_to(self.project_root)),
                            line_number=line_num,
                            message=f"Invalid Field definition: {line.strip()[:60]}...",
                            suggestion=suggestion,
                            auto_fixable=True,
                        ))

        if result.issues:
            result.status = "FAIL"

        return result

    def check_import_consistency(self) -> ValidationResult:
        """Check for inconsistent import paths"""
        result = ValidationResult(name="Import Consistency", status="PASS")

        src_dir = self.project_root / "apps" / "api" / "src"
        if not src_dir.exists():
            return result

        # Patterns for internal imports without src. prefix
        bad_import_patterns = [
            (r'^from\s+services\.', "from src.services."),
            (r'^from\s+models\.', "from src.models."),
            (r'^from\s+routes\.', "from src.routes."),
            (r'^from\s+middleware\.', "from src.middleware."),
            (r'^from\s+database\s+import', "from src.database import"),
            (r'^import\s+services\.', "import src.services."),
            (r'^import\s+models\.', "import src.models."),
        ]

        for py_file in src_dir.rglob("*.py"):
            content = py_file.read_text(encoding="utf-8")
            lines = content.split("\n")

            for line_num, line in enumerate(lines, 1):
                stripped = line.strip()
                for pattern, fix in bad_import_patterns:
                    if re.match(pattern, stripped):
                        result.issues.append(Issue(
                            severity="CRITICAL",
                            category="IMPORT",
                            file_path=str(py_file.relative_to(self.project_root)),
                            line_number=line_num,
                            message=f"Missing 'src.' prefix: {stripped[:50]}",
                            suggestion=f"Change to: {fix}...",
                            auto_fixable=True,
                            fix_pattern=(pattern.replace('^', ''), fix.replace('.', r'\.')),
                        ))

        if result.issues:
            result.status = "FAIL"

        return result

    def check_database_compatibility(self) -> ValidationResult:
        """Check for PostgreSQL-specific features"""
        result = ValidationResult(name="Database Compatibility", status="PASS")

        models_dir = self.project_root / "apps" / "api" / "src" / "models"
        if not models_dir.exists():
            return result

        pg_patterns = [
            (r'ARRAY\s*\(', "ARRAY type requires PostgreSQL"),
            (r'JSONB', "JSONB type requires PostgreSQL"),
            (r'postgresql\.', "PostgreSQL-specific import"),
            (r'gen_random_uuid\(\)', "gen_random_uuid() requires PostgreSQL"),
        ]

        pg_features_found = False

        for py_file in models_dir.glob("*.py"):
            content = py_file.read_text(encoding="utf-8")
            lines = content.split("\n")

            for line_num, line in enumerate(lines, 1):
                for pattern, msg in pg_patterns:
                    if re.search(pattern, line):
                        pg_features_found = True
                        result.issues.append(Issue(
                            severity="INFO",
                            category="DATABASE",
                            file_path=str(py_file.relative_to(self.project_root)),
                            line_number=line_num,
                            message=msg,
                            suggestion="Ensure DATABASE_URL is set for tests",
                        ))

        # Check if DATABASE_URL is set
        has_db_url = os.environ.get("DATABASE_URL") or os.environ.get("TEST_DATABASE_URL")

        if pg_features_found and not has_db_url:
            result.status = "WARN"
            result.issues.insert(0, Issue(
                severity="WARNING",
                category="DATABASE",
                file_path="environment",
                line_number=0,
                message="PostgreSQL features used but DATABASE_URL not set",
                suggestion="Set DATABASE_URL or TEST_DATABASE_URL for tests to work",
            ))

        return result

    def check_tdd_placeholders(self) -> ValidationResult:
        """Check for TDD placeholder assertions"""
        result = ValidationResult(name="TDD Placeholders", status="PASS")

        tests_dir = self.project_root / "apps" / "api" / "tests"
        if not tests_dir.exists():
            return result

        placeholder_patterns = [
            (r'assert\s+False\s*,', "Placeholder assertion"),
            (r'raise\s+NotImplementedError', "Not implemented"),
            (r'pass\s*#\s*TODO', "TODO placeholder"),
            (r'#\s*Implementation will be added', "Implementation pending"),
        ]

        for py_file in tests_dir.rglob("*.py"):
            content = py_file.read_text(encoding="utf-8")
            lines = content.split("\n")

            for line_num, line in enumerate(lines, 1):
                for pattern, msg in placeholder_patterns:
                    if re.search(pattern, line):
                        result.issues.append(Issue(
                            severity="WARNING",
                            category="TDD",
                            file_path=str(py_file.relative_to(self.project_root)),
                            line_number=line_num,
                            message=f"{msg}: {line.strip()[:40]}...",
                            suggestion="Update test after implementation",
                        ))

        if result.issues:
            result.status = "WARN"

        return result

    def check_environment_config(self) -> ValidationResult:
        """Check environment configuration"""
        result = ValidationResult(name="Environment Config", status="PASS")

        # Check for .env file
        env_file = self.project_root / ".env"
        env_example = self.project_root / ".env.example"

        required_vars = ["DATABASE_URL"]
        recommended_vars = ["TEST_DATABASE_URL", "NEXT_PUBLIC_API_URL"]

        # Check actual environment
        missing_required = [v for v in required_vars if not os.environ.get(v)]
        missing_recommended = [v for v in recommended_vars if not os.environ.get(v)]

        if missing_required:
            result.status = "WARN"
            for var in missing_required:
                result.issues.append(Issue(
                    severity="WARNING",
                    category="ENV",
                    file_path=".env",
                    line_number=0,
                    message=f"Required environment variable not set: {var}",
                    suggestion=f"Set {var} in .env or environment",
                ))

        for var in missing_recommended:
            result.issues.append(Issue(
                severity="INFO",
                category="ENV",
                file_path=".env",
                line_number=0,
                message=f"Recommended variable not set: {var}",
                suggestion=f"Consider setting {var} for full functionality",
            ))

        return result

    def auto_fix(self) -> int:
        """Attempt to auto-fix issues that support it"""
        fixed_count = 0

        for result in self.results:
            for issue in result.issues:
                if issue.auto_fixable and issue.category == "IMPORT":
                    if self._fix_import_issue(issue):
                        fixed_count += 1

        return fixed_count

    def _fix_import_issue(self, issue: Issue) -> bool:
        """Fix an import path issue"""
        file_path = self.project_root / issue.file_path
        if not file_path.exists():
            return False

        content = file_path.read_text(encoding="utf-8")
        lines = content.split("\n")

        if issue.line_number <= len(lines):
            line = lines[issue.line_number - 1]

            # Simple fix: add src. prefix
            fixes = [
                (r'^from services\.', 'from src.services.'),
                (r'^from models\.', 'from src.models.'),
                (r'^from routes\.', 'from src.routes.'),
                (r'^from middleware\.', 'from src.middleware.'),
                (r'^from database import', 'from src.database import'),
            ]

            for pattern, replacement in fixes:
                if re.match(pattern, line.strip()):
                    # Preserve indentation
                    indent = len(line) - len(line.lstrip())
                    fixed_line = " " * indent + re.sub(pattern, replacement, line.strip())
                    lines[issue.line_number - 1] = fixed_line
                    file_path.write_text("\n".join(lines), encoding="utf-8")
                    return True

        return False

    def generate_report(self, output_format: str = "text") -> str:
        """Generate validation report"""
        if output_format == "json":
            return self._generate_json_report()
        return self._generate_text_report()

    def _generate_text_report(self) -> str:
        """Generate text format report"""
        lines = []
        lines.append("=" * 70)
        lines.append("                    PREFLIGHT VALIDATION REPORT")
        lines.append("=" * 70)
        lines.append(f" Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        lines.append(f" Project: {self.project_root.name}")
        if self.feature_dir:
            lines.append(f" Feature: {self.feature_dir}")
        lines.append("=" * 70)
        lines.append("")

        # Summary table
        lines.append("┌" + "─" * 40 + "┬" + "─" * 10 + "┬" + "─" * 15 + "┐")
        lines.append(f"│ {'CHECK':<40}│ {'STATUS':<10}│ {'ISSUES':<15}│")
        lines.append("├" + "─" * 40 + "┼" + "─" * 10 + "┼" + "─" * 15 + "┤")

        for result in self.results:
            status_icon = {"PASS": "✓", "FAIL": "✗", "WARN": "⚠"}.get(result.status, "?")
            issue_count = f"{result.critical_count}C/{result.warning_count}W"
            lines.append(f"│ {result.name:<40}│ {status_icon} {result.status:<7}│ {issue_count:<15}│")

        lines.append("└" + "─" * 40 + "┴" + "─" * 10 + "┴" + "─" * 15 + "┘")
        lines.append("")

        # Critical issues
        critical_issues = [i for r in self.results for i in r.issues if i.severity == "CRITICAL"]
        if critical_issues:
            lines.append("CRITICAL ISSUES (must fix before implementation):")
            lines.append("-" * 50)
            for i, issue in enumerate(critical_issues, 1):
                lines.append(f"{i}. [{issue.category}] {issue.file_path}:{issue.line_number}")
                lines.append(f"   Message: {issue.message}")
                lines.append(f"   Fix: {issue.suggestion}")
                lines.append("")

        # Warnings
        warnings = [i for r in self.results for i in r.issues if i.severity == "WARNING"]
        if warnings:
            lines.append("WARNINGS (should fix, won't block):")
            lines.append("-" * 50)
            for i, issue in enumerate(warnings, 1):
                lines.append(f"{i}. [{issue.category}] {issue.message}")
                lines.append(f"   Suggestion: {issue.suggestion}")
            lines.append("")

        # Overall status
        has_critical = any(r.status == "FAIL" for r in self.results)
        has_warnings = any(r.status == "WARN" for r in self.results)

        lines.append("=" * 70)
        if has_critical:
            lines.append("RESULT: ✗ FAILED - Critical issues must be fixed")
            lines.append("Run with --auto-fix to attempt automatic fixes")
        elif has_warnings:
            lines.append("RESULT: ⚠ PASSED WITH WARNINGS - Review before proceeding")
        else:
            lines.append("RESULT: ✓ ALL CHECKS PASSED")
        lines.append("=" * 70)

        return "\n".join(lines)

    def _generate_json_report(self) -> str:
        """Generate JSON format report"""
        data = {
            "timestamp": datetime.now().isoformat(),
            "project": str(self.project_root),
            "feature": str(self.feature_dir) if self.feature_dir else None,
            "results": [],
            "summary": {
                "total_critical": 0,
                "total_warnings": 0,
                "overall_status": "PASS",
            }
        }

        for result in self.results:
            data["results"].append({
                "name": result.name,
                "status": result.status,
                "critical_count": result.critical_count,
                "warning_count": result.warning_count,
                "issues": [
                    {
                        "severity": i.severity,
                        "category": i.category,
                        "file": i.file_path,
                        "line": i.line_number,
                        "message": i.message,
                        "suggestion": i.suggestion,
                        "auto_fixable": i.auto_fixable,
                    }
                    for i in result.issues
                ]
            })
            data["summary"]["total_critical"] += result.critical_count
            data["summary"]["total_warnings"] += result.warning_count

            if result.status == "FAIL":
                data["summary"]["overall_status"] = "FAIL"
            elif result.status == "WARN" and data["summary"]["overall_status"] != "FAIL":
                data["summary"]["overall_status"] = "WARN"

        return json.dumps(data, indent=2)

    @property
    def has_critical_issues(self) -> bool:
        """Check if any critical issues were found"""
        return any(r.status == "FAIL" for r in self.results)


def main():
    # Set stdout to UTF-8 encoding for special characters
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

    parser = argparse.ArgumentParser(
        description="Pre-implementation validation for SDD projects"
    )
    parser.add_argument(
        "--feature-dir",
        help="Feature directory path (e.g., specs/002-phase2-chunk2)"
    )
    parser.add_argument(
        "--auto-fix",
        action="store_true",
        help="Attempt to automatically fix issues"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output in JSON format"
    )
    parser.add_argument(
        "--project-root",
        default=".",
        help="Project root directory"
    )
    parser.add_argument(
        "--ascii",
        action="store_true",
        help="Use ASCII-only output (no special characters)"
    )

    args = parser.parse_args()

    project_root = Path(args.project_root).resolve()
    feature_dir = Path(args.feature_dir) if args.feature_dir else None

    validator = PreflightValidator(project_root, feature_dir)
    validator.validate_all()

    if args.auto_fix:
        fixed = validator.auto_fix()
        if fixed > 0:
            print(f"Auto-fixed {fixed} issues. Re-running validation...")
            validator.validate_all()

    output_format = "json" if args.json else "text"
    report = validator.generate_report(output_format)

    # Replace special characters if ASCII mode
    if args.ascii:
        report = report.replace("✓", "[PASS]").replace("✗", "[FAIL]").replace("⚠", "[WARN]")
        report = report.replace("─", "-").replace("│", "|").replace("┌", "+").replace("┐", "+")
        report = report.replace("└", "+").replace("┘", "+").replace("├", "+").replace("┤", "+")
        report = report.replace("┬", "+").replace("┴", "+").replace("┼", "+")

    print(report)

    # Exit with error code if critical issues
    sys.exit(1 if validator.has_critical_issues else 0)


if __name__ == "__main__":
    main()
