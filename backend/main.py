import os
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Response, Cookie, UploadFile, Form
from typing import Annotated, Literal, List
from IOSchema import UserSignUp, UserLogIn, Organisation, OrganisationPersonalReport, OrganisationName, \
    OrganisationNameOptional, OrgTeam, TeamPersonalReport, Team, Person, InviteInput, MeetingInput, AddUserInput, \
    MeetingIdentifier, Transcription, TranscriptionDetails, MeetingDetails, TodoDetails, TodoInput, TodoEliminate, \
    TodoUpdate
from UserAccounts import createUser, getUserDetails, getUserByID, getOrganisationsByID, \
    setOrganisationActive, eatCookie, bakeCookie, inviteOrAddUser
from Organisations import createOrganisation, getOrganisationReport, getTeamReport, getMeetings, getAllMeetings, \
    getTeams, addUser, createTeam
from fastapi.middleware.cors import CORSMiddleware

from Meetings import storeMeeting, updateMeetingTranscription, getMeetingSummary, getMeetingTranscription, \
    getMeetingInfo
from Enums import Roles
from OrganisationHelpers import getRoleByID, getOrganisationByName, getTeamByName, getTRoleByID
from Todos import updateTodosOrg, addTodosOrg, getMeetTodos, getUserOrgTodos, getAllTodos
from database import deleteTodos, getUserTodosOrg, getUserOrgs

app = FastAPI()

load_dotenv()
origin = os.environ["FRONTEND"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.post("/sign-up")
async def signup(user: UserSignUp, response: Response):
    try:
        userCred, error = createUser(user)
            # The calls are separated to ensure data is actually written to DB successfully,
            #  after DB testing can merge them into 1 like current implementation
    except:
        raise HTTPException(status_code=500, detail="Internal Server Error while logging in.")
    if error is not None:
            raise HTTPException(status_code=400, detail=error)
    userDetails, error, activeOrg = getUserDetails(userCred)
    bakeCookie(userDetails.id, response)
    return {"user": userDetails}


@app.post("/sign-in")
async def signin(user: UserLogIn, response: Response):
    if user.email is None and user.username is None:
        raise HTTPException(status_code=400, detail="Invalid credentials. Please supply username or email.")
    try:
        userDetails, error, activeOrganisation = getUserDetails(user)
    except:
        raise HTTPException(status_code=500, detail="Internal Server Error while logging in.")
    if error is not None:
        raise HTTPException(status_code=401,detail=error)
    bakeCookie(userDetails.id, response)
    return {"user": userDetails, "activeOrganisation": activeOrganisation}


'''
Refreshes jwt cookie
'''


@app.get("/logged-in")
async def logged_in(response: Response, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    userDetails = getUserByID(id)
    bakeCookie(id, response)
    return userDetails


@app.get("/get-organisations")
async def getOrganisations(credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    organisations = getOrganisationsByID(id)
    return {"organisations": organisations}


@app.post("/new-organisation")
async def newOrganisation(name: OrganisationName, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    organisation: Organisation = createOrganisation(name.name, id)
    return organisation

#TODO:Security
@app.post("/organisationpage")
async def organisationPage(name: OrganisationName,
                           credentials: Annotated[str, Cookie()] = None) -> OrganisationPersonalReport:
    id = eatCookie(credentials)
    orgReport: OrganisationPersonalReport = getOrganisationReport(id, name.name)
    return orgReport


#TODO:Security
@app.post("/set-active-organisation")
async def setActiveOrganisation(name: OrganisationNameOptional, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    setOrganisationActive(id, name.name)


#TODO:Security
@app.post("/teampage")
async def teamPage(orgteam: OrgTeam, credentials: Annotated[str, Cookie()] = None) -> TeamPersonalReport:
    id: int = eatCookie(credentials)
    teamReport: TeamPersonalReport = getTeamReport(id, orgteam.name, orgteam.organisation)
    return teamReport


#TODO:Security
@app.post("/upload-meeting")
async def uploadMeeting(file: UploadFile,
                        type: Annotated[Literal["organisation", "team"], Form()],
                        meetingName: Annotated[str, Form()],
                        meetingDate: Annotated[datetime, Form()],
                        organisation: Annotated[str, Form()],
                        team: Annotated[str | None, Form()] = None,
                        credentials: Annotated[str, Cookie()] = None):
    input = MeetingInput(file=file, type=type, meetingName=meetingName, meetingDate=meetingDate, team=team,
                         organisation=organisation)
    #id = eatCookie(credentials)
    storeMeeting(input)


#TODO:Security
@app.post("/new-team")
async def newTeam(orgteam: OrgTeam, credentials: Annotated[str, Cookie()] = None) -> Team:
    id = eatCookie(credentials)
    id = createTeam(id, orgteam)
    return Team(id=id, name=orgteam.name)


#TODO:Security
@app.post("/get-team-meetings")
async def getTeamMeetings(orgteam: OrgTeam, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    meetings = getMeetings(orgteam)
    return {"teams": meetings}


#TODO:Security
@app.post("/get-organisation-meetings")
async def getOrganisationMeetings(name: OrganisationName, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    meetings = getAllMeetings(name.name)
    return {"organisations": meetings}


#TODO:Security
@app.post("/get-organisation-teams")
async def getOrganisationTeams(name: OrganisationName, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    teams = getTeams(name.name, id)
    return {"teams": teams}


#TODO:Security
@app.post("/get-admin-teams")
async def getAdminTeams(name: OrganisationName, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    teams = getTeams(name.name, id, Roles.ADMIN)
    return {"teams": teams}


#TODO:Security
@app.post("/get-user-role")
async def getUserRole(org: OrganisationName, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    org = getOrganisationByName(org.name)
    role = getRoleByID(org, id)
    return {"role": role}


#TODO:Security
@app.post('/get-team-role')
async def getUserRole(orgteam: OrgTeam, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    org = getOrganisationByName(orgteam.organisation)
    team = getTeamByName(org, orgteam.name)
    role = getTRoleByID(org, team, id)
    return {"role": role}


#TODO:Security
@app.post('/add-team-user')
async def addTeamUser(input: AddUserInput,
                      credentials: Annotated[str, Cookie()] = None) -> Person:
    id = eatCookie(credentials)
    user: Person = addUser(input.organisation, input.userId, input.role, input.teamName)
    return user


#TODO:Security
@app.post('/invite-user')
async def inviteUser(input: InviteInput, credentials: Annotated[str, Cookie()] = None):
    output = inviteOrAddUser(input.email, input.role.value, input.organisation)
    return output


#TODO:Security
@app.head('/logout')
async def logout(response: Response):
    response.delete_cookie("credentials", httponly=True, secure=True, samesite="none")


#TODO:Security
@app.post('/update-transcription')
async def updateTranscription(meeting: Transcription,
                              credentials: Annotated[str, Cookie()] = None) -> TranscriptionDetails:
    id = eatCookie(credentials)
    details = updateMeetingTranscription(meeting.organisation, meeting.meetingid, meeting.transcription)
    return details


#TODO:Security
@app.post('/get-summary')
async def getSummary(meeting: MeetingIdentifier, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    summary = getMeetingSummary(meeting.organisation, meeting.meetingid)
    return {"summary": summary}

#TODO:Security
@app.post('/get-transcription')
async def getTranscription(meeting: MeetingIdentifier,
                           credentials: Annotated[str, Cookie()] = None) -> TranscriptionDetails:
    id = eatCookie(credentials)
    details = getMeetingTranscription(meeting.organisation, meeting.meetingid)
    return details


@app.post('/get-meeting-details')
async def getMeetingDetails(meeting: MeetingIdentifier,
                            credentials: Annotated[str, Cookie()] = None) -> MeetingDetails:
    id = eatCookie(credentials)
    details = getMeetingInfo(meeting.organisation, meeting.meetingid)
    return details


@app.post('/add-todo')
async def addTodo(todo: TodoInput, credentials: Annotated[str, Cookie()] = None) -> TodoDetails:
    id = eatCookie(credentials)
    todos = addTodosOrg(todo)
    return todos


@app.put('/edit-todo')
async def editTodo(todo: TodoUpdate, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    updateTodosOrg(todo)


@app.delete('/delete-todo')
async def deleteTodo(todo: TodoEliminate, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    org = getOrganisationByName(todo.organisation)
    if not org:
        raise HTTPException(status_code=404, detail=f"Organisation {todo.organisation} not found.")
    deleteTodos(org, todo.todoid)


@app.post('/get-meeting-todos')
async def getMeetingTodos(meeting: MeetingIdentifier, credentials: Annotated[str, Cookie()] = None) -> List[
    TodoDetails]:
    id = eatCookie(credentials)
    org = getOrganisationByName(meeting.organisation)
    if not org:
        raise HTTPException(status_code=404, detail=f"Organisation {meeting.organisation} not found.")
    todos = getMeetTodos(org, meeting.meetingid)
    return todos


@app.post('/get-all-user-todos')
async def getAllUserTodos(organisation: OrganisationName, credentials: Annotated[str, Cookie()] = None) -> List[
    TodoDetails]:
    id = eatCookie(credentials)
    org = getOrganisationByName(organisation.name)
    if not org:
        raise HTTPException(status_code=404, detail=f"Organisation {organisation.name} not found.")
    todos = getUserOrgTodos(id, org)
    return todos


@app.get('/get-user-todos')
async def getUserTodos(credentials: Annotated[str, Cookie()] = None) -> List[TodoDetails]:
    id = eatCookie(credentials)
    return getAllTodos(id)


@app.head('/health')
async def health():
    pass
