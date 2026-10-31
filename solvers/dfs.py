from __future__ import annotations
from solvers.base import Problem, SearchResult
from typing import Dict, List, Optional, Tuple
from core.state import State
from core.constants import Action


def reconstruct_path(
    parent_map: Dict[State, Tuple[Optional[State], Optional[Action], float]],
    goal_state: State,
) -> Tuple[List[Action], float]:
    path: List[Action] = []
    total_cost = 0.0
    cur: Optional[State] = goal_state

    while cur is not None:
        parent_state, action, step_cost = parent_map[cur]
        if action is not None:
            path.append(action)
            total_cost += step_cost
        cur = parent_state

    path.reverse()
    return path, total_cost


def solve(problem: Problem, max_nodes: int = 100000) -> SearchResult:
    initial_state: State = problem.initial_state

    if problem.is_goal(initial_state):
        return SearchResult(found=True, path=[], cost=0.0, expanded_nodes=0)

    stack = [initial_state]
    visited = {initial_state}
    parent_map: Dict[State, Tuple[Optional[State], Optional[Action], float]] = {
        initial_state: (None, None, 0.0)
    }
    nodes_count = 0

    while stack:
        cur_state = stack.pop()
        nodes_count += 1

        if nodes_count > max_nodes:
            break

        for action, next_state, step_cost in problem.successors(cur_state):
            if next_state not in visited:
                visited.add(next_state)
                parent_map[next_state] = (cur_state, action, step_cost)

                if problem.is_goal(next_state):
                    solution_path, total_cost = reconstruct_path(parent_map, next_state)
                    return SearchResult(
                        found=True,
                        path=solution_path,
                        cost=total_cost,
                        expanded_nodes=nodes_count,
                    )

                stack.append(next_state)

    return SearchResult(found=False, expanded_nodes=nodes_count)
