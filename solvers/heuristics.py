"""Student heuristic contracts."""

from __future__ import annotations
from core.state import State
from solvers.base import Problem


def h_center(problem: Problem, state: State) -> float:
    """Center of mass Manhattan distance to goal divided by max step delta (1.5).

    Consistent and admissible lower bound on remaining cost.
    """
    gr, gc = problem.level.goal
    cr = sum(r for r, _ in state.cubes) / len(state.cubes)
    cc = sum(c for _, c in state.cubes) / len(state.cubes)
    return (abs(cr - gr) + abs(cc - gc)) / 1.5


def h_relaxed(problem: Problem, state: State) -> float:
    """Relaxed problem: min Manhattan distance of any block cell to goal divided by 2.0.

    Relaxes the 3D block rotation constraint, assuming any block piece can reach goal.
    """
    gr, gc = problem.level.goal
    return min(abs(r - gr) + abs(c - gc) for r, c in state.cubes) / 2.0


HEURISTICS = {"center": h_center, "relaxed": h_relaxed}
