from __future__ import annotations
import heapq
import itertools
from core.constants import Action
from core.state import State
from solvers.base import Problem, SearchResult


def solve(problem: Problem) -> SearchResult:
    start_state = problem.initial_state
    counter = itertools.count()
    heuristic = problem.heuristic if problem.heuristic is not None else (lambda p, s: 0.0)

    h0 = heuristic(problem, start_state)
    frontier: list[tuple[float, float, int, State, list[Action]]] = [
        (h0, 0.0, next(counter), start_state, [])
    ]

    best_g: dict[State, float] = {start_state: 0.0}
    expanded_nodes = 0

    while frontier:
        _f, g, _, state, path = heapq.heappop(frontier)

        if g > best_g.get(state, float("inf")):
            continue

        expanded_nodes += 1

        if problem.is_goal(state):
            return SearchResult(
                found=True,
                path=path,
                cost=g,
                expanded_nodes=expanded_nodes,
            )

        for action, next_state, step_cost in problem.successors(state):
            new_g = g + step_cost
            if new_g < best_g.get(next_state, float("inf")):
                best_g[next_state] = new_g
                h = heuristic(problem, next_state)
                heapq.heappush(
                    frontier,
                    (new_g + h, new_g, next(counter), next_state, path + [action]),
                )

    return SearchResult(found=False, expanded_nodes=expanded_nodes)

