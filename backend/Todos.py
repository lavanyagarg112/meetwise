from fastapi import HTTPException

from backend.IOSchema import TodoInput, TodoUpdate, TodoDetails
from backend.OrganisationHelpers import getOrganisationByName
from backend.UserAccounts import getUserByID
from backend.database import updateTodos, addTodos


def addTodosOrg(todo:TodoInput) -> TodoDetails:
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
