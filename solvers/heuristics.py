from __future__ import annotations
from core.state import State
from solvers.base import Problem


def h_center(problem: Problem, state: State) -> float:
    gr, gc = problem.level.goal
    cr = sum(r for r, _ in state.cubes) / len(state.cubes)
    cc = sum(c for _, c in state.cubes) / len(state.cubes)
    return (abs(cr - gr) + abs(cc - gc)) / 1.5


def h_relaxed(problem: Problem, state: State) -> float:
    gr, gc = problem.level.goal
    return min(abs(r - gr) + abs(c - gc) for r, c in state.cubes) / 2.0


HEURISTICS = {"center": h_center, "relaxed": h_relaxed}

