from typing import List, Tuple

from fastapi import HTTPException

from IOSchema import TodoInput, TodoUpdate, TodoDetails
from OrganisationHelpers import getOrganisationByName
from UserAccounts import getUserByID
from Meeting import Task
from database import updateTodos, addTodos, getMeetingTodos, getUserTodosOrg, getUserOrgs, getUserTodos, \
    replaceMeetTodos


def todoBuilder(row: Tuple) -> TodoDetails:
    assigner = getUserByID(row[3])
    if assigner:
        assigner = assigner.user
    assignee = getUserByID(row[4])
    if assignee:
        assignee = assignee.user
    return TodoDetails(id=row[0], details=row[1], deadline=row[2].replace('T', ' '), assigner=assigner,
                       assignee=assignee, isCompleted=row[5])


def getMeetTodos(orgId: int, meetingID: int) -> List[TodoDetails]:
    details = getMeetingTodos(orgId, meetingID)
    if not details:
        return []
    details = list(map(todoBuilder, details))
    return details


def getUserOrgTodos(userId: int, orgId: int) -> List[TodoDetails]:
    details = getUserTodosOrg(userId, orgId)
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


def getAllTodos(userId: int) -> List[TodoDetails]:
    details = getUserOrgs(userId)
    if not details:
        return []
    unwrap = lambda x: x[0]
    details = list(map(unwrap, details))
    dbDetails = getUserTodos(userId, details)
    if not dbDetails:
        return []
    dbDetails = list(map(todoBuilder, dbDetails))
    return dbDetails


def replaceTodos(organisation: int, meetingId: int, todos: List[Task]):
    TaskUnwrapper = lambda row: (row.description, row.deadline.strftime('%Y-%m-%d %H:%M:%S') if row.deadline else None)
    todos = list(map(TaskUnwrapper, todos))
    replaceMeetTodos(organisation, meetingId, todos)



