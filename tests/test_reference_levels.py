"""Compare every tile and linked effect to independently retained reference data."""
from __future__ import annotations

import json
import hashlib
from pathlib import Path
import pytest
from core.level import Level

ROOT = Path(__file__).resolve().parents[1]
REFERENCE = json.loads((Path(__file__).parent / "fixtures/reference15.json").read_text())


@pytest.mark.parametrize("source", REFERENCE, ids=lambda x: str(x["stage"]))
def test_reference_stage_data(source):
    level = Level.load(ROOT / "levels" / f'level_{source["stage"]:02d}.json')
    types = {" ": "void", "b": "floor", "f": "fragile", "e": "goal",
             "s": "soft_switch", "h": "heavy_switch", "v": "split_switch",
             "l": "bridge", "r": "bridge", "k": "bridge", "q": "bridge"}
    assert level.start == tuple(reversed(source["start_xy"]))
    assert level.height == len(source["grid"]) and level.width == 15
    for r, row in enumerate(source["grid"]):
        for c, symbol in enumerate(row):
            expected = "start" if (r, c) == level.start else types[symbol]
            assert level.tile_at(r, c) == expected
            if symbol in "lrkq":
                assert level.is_supported((r, c), level.initial_bridges) == (symbol in "kq")
    bridges = {bridge.id: bridge for bridge in level.bridges}
    for switch in level.switches:
        r, c = switch.cell
        key = f"swatch{c}{r}"
        effects = []
        mode = "onoff" if switch.mode == "toggle" else "on" if switch.set_open else "off"
        for target in switch.targets:
            for br, bc in bridges[target].cells:
                effects.append([bc, br, mode])
        assert effects == source["switches"].get(key, [])
        if switch.type == "split":
            assert [v for cell in switch.cubes for v in reversed(cell)] == source["teleports"][key]
    assert level.meta["reference_code"] == source["passcode"]


@pytest.mark.parametrize("stage", range(1, 16))
def test_certificate_matches_current_data_and_rules(stage):
    """Replay alone cannot detect a stale optimality certificate after edits."""
    data = json.loads((ROOT / "levels" / f"level_{stage:02d}.json").read_text())
    certificate = data.pop("meta")["verification"]
    payload = json.dumps(data, sort_keys=True, separators=(",", ":")).encode()
    assert hashlib.sha256(payload).hexdigest() == certificate["level_data_sha256"]
    for name, expected in certificate["core_sha256"].items():
        assert hashlib.sha256((ROOT / "core" / name).read_bytes()).hexdigest() == expected
