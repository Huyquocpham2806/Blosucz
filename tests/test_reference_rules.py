"""Landing traces checked against the reference SWF's cube/merge handlers."""
from __future__ import annotations

from core.constants import Action
from core.rules import step
from core.state import State
from tests.conftest import make_level


def switch_board():
    return make_level(
        ["S#######G", "##o######", "########B", "#########"],
        [{"id": 0, "cells": [[2, 8]]}],
        [{"cell": [1, 2], "type": "soft", "mode": "toggle", "targets": [0]}],
    )


def test_stationary_cube_does_not_press_again():
    level = switch_board()
    before = State(((1, 2), (3, 6)), True, 1, 1)
    result = step(level, before, Action.LEFT)
    assert result.state.bridges == 1
    assert [e.type for e in result.events] == ["roll"]
    swapped = step(level, result.state, Action.SWAP)
    assert swapped.state.bridges == 1
    left = step(level, swapped.state, Action.LEFT)
    entered = step(level, left.state, Action.RIGHT)
    assert entered.state.bridges == 0


def test_merge_is_a_separate_whole_block_landing():
    level = switch_board()
    # Moved cube presses the switch; the merged block lands and presses it again.
    before = State(((0, 2), (1, 3)), True)
    result = step(level, before, Action.DOWN)
    assert result.state == State(((1, 2), (1, 3)), bridges=0)
    assert [e.type for e in result.events] == [
        "roll", "switch_pressed", "bridge_changed", "merge",
        "switch_pressed", "bridge_changed",
    ]


def test_merge_presses_switch_beneath_stationary_cube_once():
    level = switch_board()
    result = step(level, State(((1, 2), (1, 4)), True, 1), Action.LEFT)
    assert result.state == State(((1, 2), (1, 3)), bridges=1)
    assert [e.type for e in result.events] == [
        "roll", "merge", "switch_pressed", "bridge_changed",
    ]
