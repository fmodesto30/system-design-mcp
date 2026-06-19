#!/usr/bin/env python
"""Merge the _parts/*.json into the canonical knowledge-base/*.json and validate against the schema.

Run with the workspace venv python. Idempotent: rewrites the final files each time.
"""
import json
import sys
from pathlib import Path
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parent.parent
KB = ROOT / "knowledge-base"
PARTS = KB / "_parts"
SCHEMA = json.loads((KB / "schema" / "knowledge-base.schema.json").read_text("utf-8"))

# final file -> ($def name, [part files])
PLAN = {
    "topics.json": ("Topic", ["topics.part1.json", "topics.part2.json", "topics.part3.json"]),
    "patterns.json": ("Pattern", ["patterns.part1.json", "patterns.part2.json"]),
    "flows.json": ("Flow", ["flows.json"]),
    "interview-questions.json": ("InterviewQuestion", ["interview.part1.json", "interview.part2.json"]),
    "diagrams.json": ("Diagram", ["diagrams.json"]),
    "evidence.json": ("Evidence", ["evidence.json"]),
}


def load_array(p: Path):
    data = json.loads(p.read_text("utf-8"))
    if not isinstance(data, list):
        raise SystemExit(f"{p.name}: expected a JSON array, got {type(data).__name__}")
    return data


def main():
    errors = []
    summary = []
    for final, (defname, parts) in PLAN.items():
        merged = []
        for part in parts:
            pf = PARTS / part
            if not pf.exists():
                errors.append(f"MISSING part: {part}")
                continue
            merged.extend(load_array(pf))

        # duplicate id check
        ids = [it.get("id") for it in merged]
        dupes = {i for i in ids if ids.count(i) > 1}
        if dupes:
            errors.append(f"{final}: duplicate ids {sorted(dupes)}")

        # schema validation (array of <def>)
        array_schema = {
            "$schema": SCHEMA["$schema"],
            "$defs": SCHEMA["$defs"],
            "type": "array",
            "items": {"$ref": f"#/$defs/{defname}"},
        }
        validator = Draft202012Validator(array_schema)
        n_err = 0
        for err in validator.iter_errors(merged):
            n_err += 1
            loc = "/".join(str(x) for x in err.absolute_path)
            if n_err <= 8:
                errors.append(f"{final}[{loc}]: {err.message}")
        if n_err > 8:
            errors.append(f"{final}: ...and {n_err - 8} more schema errors")

        # write final
        out = KB / final
        out.write_text(json.dumps(merged, ensure_ascii=False, indent=2), "utf-8")
        summary.append((final, len(merged), n_err))

    print("=== merge summary ===")
    for final, n, e in summary:
        print(f"  {final:28} items={n:3}  schema_errors={e}")

    if errors:
        print("\n=== ISSUES ===")
        for e in errors:
            print("  -", e)
        sys.exit(1)
    print("\nALL OK")


if __name__ == "__main__":
    main()
