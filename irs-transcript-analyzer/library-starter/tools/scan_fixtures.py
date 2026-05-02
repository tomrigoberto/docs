"""Sanity-scan fixtures for plausible real PII.

We never want real client data in fixtures. This catches the most common shapes:
  - SSN-like patterns (NNN-NN-NNNN)
  - 9-digit numeric runs that could be SSNs/EINs
  - Common name/email leakage patterns

Usage (from library repo root):
    python tools/scan_fixtures.py

The heuristics are intentionally conservative; tighten over time.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

_SSN_RE = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")
_LONG_NUM_RE = re.compile(r"(?<!\d)\d{9}(?!\d)")
_EMAIL_RE = re.compile(r"[\w.-]+@[\w.-]+\.[A-Za-z]{2,}")


def main() -> int:
    errors: list[str] = []
    fixtures_dir = ROOT / "fixtures"
    if not fixtures_dir.exists():
        print("OK — no fixtures directory.")
        return 0
    for path in fixtures_dir.rglob("*.json"):
        text = path.read_text()
        rel = path.relative_to(ROOT).as_posix()
        if _SSN_RE.search(text):
            errors.append(f"{rel}: contains SSN-like pattern (NNN-NN-NNNN)")
        if _LONG_NUM_RE.search(text):
            errors.append(f"{rel}: contains a 9-digit run (possible SSN or EIN)")
        for email in _EMAIL_RE.findall(text):
            if "example." not in email and "test." not in email:
                errors.append(f"{rel}: contains email address ({email})")
    if errors:
        for e in errors:
            print("FAIL", e)
        return 1
    print("OK — fixtures look synthetic.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
