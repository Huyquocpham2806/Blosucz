"""Student implementation slot: IDS."""

from __future__ import annotations
from core.constants import Action
from core.state import State
from solvers.base import Problem, SearchResult


def solve(problem: Problem) -> SearchResult:
    """Iterative Deepening Search (IDS / IDDFS).

    Input: Problem. Output: SearchResult(found, path, cost, expanded_nodes).
    Uses Depth-Limited Search with iterative deepening and remaining-depth
    memoization to avoid redundant branch expansions across depth bounds.
    """
    start_state = problem.initial_state
    if problem.is_goal(start_state):
        return SearchResult(
            found=True,
            path=[],
            cost=0.0,
            expanded_nodes=1,
        )

    total_expanded = 0
    # max_rem tracks the maximum remaining depth budget with which a state has been explored
    max_rem: dict[State, int] = {}

    def dls(
        state: State,
        path: list[Action],
        cost: float,
        depth: int,
        limit: int,
    ) -> SearchResult | None:
        nonlocal total_expanded
        total_expanded += 1

        if problem.is_goal(state):
            return SearchResult(
                found=True,
                path=path,
                cost=cost,
                expanded_nodes=total_expanded,
            )

        rem = limit - depth
        if rem <= 0:
            return None

        max_rem[state] = rem

        for action, next_state, step_cost in problem.successors(state):
            next_rem = rem - 1
            # Only explore next_state if we have a larger depth budget than any previous exploration
            if next_rem > max_rem.get(next_state, -1):
                res = dls(
                    next_state,
                    path + [action],
                    cost + step_cost,
                    depth + 1,
                    limit,
                )
                if res is not None:
                    return res

        return None

    # Iterative deepening from depth limit 1 upwards
    for limit in range(1, 150):
        result = dls(start_state, [], 0.0, 0, limit)
        if result is not None:
            result.expanded_nodes = total_expanded
            return result

    return SearchResult(found=False, expanded_nodes=total_expanded)
