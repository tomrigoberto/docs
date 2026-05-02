"""Validate observations against the JSON Schema and verify pattern references.

Usage (from the library repo root):
    python tools/validate.py
"""

from __future__ import annotations

import glob
import json
import sys
from pathlib import Path

try:
    import yaml
    from jsonschema import Draft202012Validator
except ImportError as e:  # pragma: no cover
    print(f"missing dependency: {e}. install with: pip install pyyaml jsonschema")
    sys.exit(2)

ROOT = Path(__file__).resolve().parents[1]


def _load_yaml(path: Path) -> dict:
    with path.open() as f:
        return yaml.safe_load(f) or {}


def main() -> int:
    schema = json.loads((ROOT / "schemas/observation.schema.json").read_text())
    validator = Draft202012Validator(schema)

    known_patterns = {
        _load_yaml(Path(p)).get("pattern")
        for p in glob.glob(str(ROOT / "patterns/*.yaml"))
    }
    known_disclaimers = set((_load_yaml(ROOT / "disclaimers/disclaimers.yaml") or {}).keys())

    errors: list[str] = []

    def walk_logic(node: dict, path: str) -> None:
        if not isinstance(node, dict):
            return
        if "pattern" in node:
            if node["pattern"] not in known_patterns and node["pattern"] != "custom_expression":
                errors.append(f"{path}: unknown pattern '{node['pattern']}'")
        for kind in ("all_of", "any_of", "none_of"):
            for child in node.get(kind, []):
                walk_logic(child, path)
        if "not" in node:
            walk_logic(node["not"], path)

    obs_files = glob.glob(str(ROOT / "observations/**/*.yaml"), recursive=True)
    for path_str in obs_files:
        path = Path(path_str)
        rel = path.relative_to(ROOT).as_posix()
        obs = _load_yaml(path)

        for err in validator.iter_errors(obs):
            loc = "/".join(str(p) for p in err.absolute_path)
            errors.append(f"{rel} ({loc}): {err.message}")

        walk_logic(obs.get("logic", {}), rel)

        for d in obs.get("disclaimers", []):
            if d not in known_disclaimers:
                errors.append(f"{rel}: unknown disclaimer '{d}'")

        if obs.get("confidence") in ("inferential", "speculative") and not obs.get("caveats"):
            errors.append(f"{rel}: caveats required when confidence is {obs.get('confidence')}")

        if obs.get("category") == "estate" or any(
            kw in (obs.get("subcategory") or "") for kw in ["audit", "lien", "levy", "compliance"]
        ):
            if "DISC-NOT-LEGAL-ADVICE" not in obs.get("disclaimers", []):
                errors.append(
                    f"{rel}: DISC-NOT-LEGAL-ADVICE required for estate/compliance observations"
                )

    if errors:
        for e in errors:
            print("FAIL", e)
        print(f"\n{len(errors)} error(s) across {len(obs_files)} observation(s).")
        return 1
    print(f"OK — {len(obs_files)} observation(s) valid.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
