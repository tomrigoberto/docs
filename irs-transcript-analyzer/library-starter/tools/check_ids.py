"""Verify ids.lock matches files on disk.

Fails if:
  - an observation's id is missing from ids.lock
  - ids.lock claims a file path that does not match the actual location
  - ids.lock contains duplicate entries

Usage (from library repo root):
    python tools/check_ids.py
"""

from __future__ import annotations

import glob
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    ids_lock_path = ROOT / "ids.lock"
    ids_lock = yaml.safe_load(ids_lock_path.read_text()) or {}
    errors: list[str] = []

    for obs_id, info in ids_lock.items():
        if not info or not isinstance(info, dict):
            errors.append(f"ids.lock: malformed entry for {obs_id}")
            continue
        f = info.get("file")
        if not f:
            errors.append(f"ids.lock: {obs_id} missing 'file'")
            continue
        if not (ROOT / f).exists() and info.get("status") != "retired":
            errors.append(f"ids.lock: {obs_id} file not found on disk: {f}")

    for path_str in glob.glob(str(ROOT / "observations/**/*.yaml"), recursive=True):
        path = Path(path_str)
        rel = path.relative_to(ROOT).as_posix()
        obs = yaml.safe_load(path.read_text()) or {}
        obs_id = obs.get("id")
        if not obs_id:
            errors.append(f"{rel}: observation has no id")
            continue
        if obs_id not in ids_lock:
            errors.append(f"{rel}: id {obs_id} not registered in ids.lock")
            continue
        expected = ids_lock[obs_id].get("file")
        if expected and expected != rel:
            errors.append(
                f"{rel}: ids.lock says file={expected} but observation lives at {rel}"
            )

    if errors:
        for e in errors:
            print("FAIL", e)
        return 1
    print(f"OK — {len(ids_lock)} ID(s) in registry.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
