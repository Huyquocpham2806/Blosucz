from __future__ import annotations
from solvers.base import Problem, SearchResult
from typing import Dict, List, Optional, Tuple
from collections import deque
from core.state import State


def reconstruct_path(
    parent_map: Dict[State, Tuple[Optional[State], Optional[str]]],
    goal_state: State
) -> List[str]:
    path = []
    cur = goal_state

    while cur is not None:
        parent_state, action = parent_map[cur]
        if action is not None:
            path.append(action)
        cur = parent_state

    path.reverse()
    return path


def solve(problem: Problem, max_nodes: int = 100000) -> SearchResult:
    initial_state: State = problem.initial_state

    if problem.is_goal(initial_state):
        return SearchResult(True, [], 0, 0)

    queue = deque([initial_state])
    visited = {initial_state}
    parent_map = {initial_state: (None, None)}
    nodes_count = 0

    while queue:
        cur_state = queue.popleft()
        nodes_count += 1

        if nodes_count > max_nodes:
            break

        # Sửa lại đoạn này để nhận các giá trị trả về từ successors
        for item in problem.successors(cur_state):
            action, next_state = item[0], item[1]

            if next_state not in visited:
                visited.add(next_state)
                parent_map[next_state] = (cur_state, action)

                if problem.is_goal(next_state):
                    solution_path = reconstruct_path(parent_map, next_state)
                    return SearchResult(True, solution_path, len(solution_path), nodes_count)

                queue.append(next_state)

    return SearchResult(False, [], 0, nodes_count)