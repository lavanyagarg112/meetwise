from typing import List, Tuple

from fastapi import HTTPException

from backend.IOSchema import TodoInput, TodoUpdate, TodoDetails
from backend.OrganisationHelpers import getOrganisationByName
from backend.UserAccounts import getUserByID
from backend.database import updateTodos, addTodos, getMeetingTodos


def todoBuilder(row: Tuple) -> TodoDetails:
    assigner = getUserByID(row[3]).user
    assignee = getUserByID(row[4]).user
    return TodoDetails(id=row[0], details=row[1], deadline=row[2].replace('T', ' '), assigner=assigner,
                       assignee=assignee, isCompleted=row[5])


def getMeetTodos(orgId: int, meetingID: int) -> List[TodoDetails]:
    details = getMeetingTodos(orgId, meetingID)
    if not details:
        return []
    details = list(map(todoBuilder, details))
    return details


def addTodosOrg(todo: TodoInput) -> TodoDetails:
    org = getOrganisationByName(todo.organisation)
    if not org:
        raise HTTPException(status_code=404, detail=f"Organisation {todo.organisation} not found")
    deadline = todo.deadline.strftime('%Y-%m-%d %H:%M:%S')
    todo_id = addTodos(org, todo.meetingid, todo.details, deadline, todo.assigner, todo.assignee, todo.isCompleted)
    assigner = getUserByID(todo.assigner).user
    assignee = getUserByID(todo.assignee).user
    return TodoDetails(id=todo_id, details=todo.details, deadline=deadline, assigner=assigner, assignee=assignee,
                       isCompleted=todo.isCompleted)


def updateTodosOrg(todo: TodoUpdate):
    org = getOrganisationByName(todo.organisation)
    if not org:
        raise HTTPException(status_code=404, detail="organisation not found")
    deadline = todo.deadline.strftime('%Y-%m-%d %H:%M:%S')
    updateTodos(todo.todoid, org, todo.meetingid, todo.details, deadline, todo.assigner, todo.assignee,
                todo.isCompleted)
