"""Student implementation slot: UCS."""

from __future__ import annotations
import heapq
import itertools
from core.constants import Action
from core.state import State
from solvers.base import Problem, SearchResult


def solve(problem: Problem) -> SearchResult:
    """Uniform-Cost Search (Dijkstra on state space).

    Input: Problem. Output: SearchResult(found, path, cost, expanded_nodes).
    """
    start_state = problem.initial_state
    counter = itertools.count()

    # Priority queue: (cost, tie_breaker_id, state, path)
    frontier: list[tuple[float, int, State, list[Action]]] = [
        (0.0, next(counter), start_state, [])
    ]

    # best_cost tracks the lowest cost known to reach each state
    best_cost: dict[State, float] = {start_state: 0.0}
    expanded_nodes = 0

    while frontier:
        cost, _, state, path = heapq.heappop(frontier)

        # Discard stale entry if a cheaper path to this state was already processed
        if cost > best_cost.get(state, float("inf")):
            continue

        expanded_nodes += 1

        if problem.is_goal(state):
            return SearchResult(
                found=True,
                path=path,
                cost=cost,
                expanded_nodes=expanded_nodes,
            )

        for action, next_state, step_cost in problem.successors(state):
            new_cost = cost + step_cost
            if new_cost < best_cost.get(next_state, float("inf")):
                best_cost[next_state] = new_cost
                heapq.heappush(
                    frontier,
                    (new_cost, next(counter), next_state, path + [action]),
                )

    return SearchResult(found=False, expanded_nodes=expanded_nodes)
