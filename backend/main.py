import os
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Response, Cookie, UploadFile, Form
from typing import Annotated, Literal, List
from backend.States.IOSchema import UserSignUp, UserLogIn, Organisation, OrganisationPersonalReport, OrganisationName, \
    OrganisationNameOptional, OrgTeam, TeamPersonalReport, Team, Person, InviteInput, MeetingInput, AddUserInput, \
    MeetingIdentifier, Transcription, TranscriptionDetails, MeetingDetails, TodoDetails, TodoInput, TodoEliminate, \
    TodoUpdate, Name, Password
from backend.Profile.UserAccounts import createUser, getUserDetails, getUserByID, getOrganisationsByID, \
    setOrganisationActive, eatCookie, bakeCookie, inviteOrAddUser, deleteUserByID, updateUsername, updatePassword
from backend.Organisation.Organisations import createOrganisation, getOrganisationReport, getTeamReport, getMeetings, \
    getAllMeetings, \
    getTeams, addUser, createTeam, deleteOrganisation
from fastapi.middleware.cors import CORSMiddleware

from backend.Meeting.Meetings import storeMeeting, updateMeetingTranscription, getMeetingSummary, \
    getMeetingTranscription, \
    getMeetingInfo, deleteMeeting, hardDeleteMeeting
from backend.States.Enums import Roles
from backend.Organisation.OrganisationHelpers import getRoleByID, getOrganisationByName, getTeamByName, getTRoleByID
from backend.Meeting.Todos import updateTodosOrg, addTodosOrg, getMeetTodos, getUserOrgTodos, getAllTodos
from backend.database.database import deleteTodos

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
        userDetails, error = createUser(user)
        # The calls are separated to ensure data is actually written to DB successfully,
        #  after DB testing can merge them into 1 like current implementation
    except:
        raise HTTPException(status_code=500, detail="Internal Server Error while logging in.")
    if error is not None:
        raise HTTPException(status_code=400, detail=error.value)
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
        raise HTTPException(status_code=401, detail=error.value)
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


@app.post("/organisationpage")
async def organisationPage(name: OrganisationName,
                           credentials: Annotated[str, Cookie()] = None) -> OrganisationPersonalReport:
    id = eatCookie(credentials)
    orgReport: OrganisationPersonalReport = getOrganisationReport(id, name.name)
    return orgReport


@app.post("/set-active-organisation")
async def setActiveOrganisation(name: OrganisationNameOptional, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    setOrganisationActive(id, name.name)


@app.post("/teampage")
async def teamPage(orgteam: OrgTeam, credentials: Annotated[str, Cookie()] = None) -> TeamPersonalReport:
    id: int = eatCookie(credentials)
    teamReport: TeamPersonalReport = getTeamReport(id, orgteam.name, orgteam.organisation)
    return teamReport


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
    id = eatCookie(credentials)
    storeMeeting(id, input)


@app.post("/new-team")
async def newTeam(orgteam: OrgTeam, credentials: Annotated[str, Cookie()] = None) -> Team:
    id = eatCookie(credentials)
    id = createTeam(id, orgteam)
    return Team(id=id, name=orgteam.name)


@app.post("/get-team-meetings")
async def getTeamMeetings(orgteam: OrgTeam, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    meetings = getMeetings(id, orgteam)
    return {"teams": meetings}


@app.post("/get-organisation-meetings")
async def getOrganisationMeetings(name: OrganisationName, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    meetings = getAllMeetings(id, name.name)
    return {"organisations": meetings}


@app.post("/get-organisation-teams")
async def getOrganisationTeams(name: OrganisationName, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    teams = getTeams(name.name, id)
    return {"teams": teams}


@app.post("/get-admin-teams")
async def getAdminTeams(name: OrganisationName, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    teams = getTeams(name.name, id, Roles.ADMIN)
    return {"teams": teams}


@app.post("/get-user-role")
async def getUserRole(org: OrganisationName, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    org = getOrganisationByName(org.name)
    role = getRoleByID(org, id)
    return {"role": role}


@app.post('/get-team-role')
async def getUserRole(orgteam: OrgTeam, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    org = getOrganisationByName(orgteam.organisation)
    team = getTeamByName(org, orgteam.name)
    role = getTRoleByID(org, team, id)
    return {"role": role}


@app.post('/add-team-user')
async def addTeamUser(input: AddUserInput,
                      credentials: Annotated[str, Cookie()] = None) -> Person:
    id = eatCookie(credentials)
    user: Person = addUser(id, input.organisation, input.userId, input.role, input.teamName)
    return user


@app.post('/invite-user')
async def inviteUser(input: InviteInput, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    output = inviteOrAddUser(id, input.email, input.role.value, input.organisation)
    return output


@app.head('/logout')
async def logout(response: Response):
    response.delete_cookie("credentials", httponly=True, secure=True, samesite="none")


@app.post('/update-transcription')
async def updateTranscription(meeting: Transcription,
                              credentials: Annotated[str, Cookie()] = None) -> TranscriptionDetails:
    id = eatCookie(credentials)
    details = updateMeetingTranscription(id, meeting.organisation, meeting.meetingid, meeting.transcription)
    return details


@app.post('/get-summary')
async def getSummary(meeting: MeetingIdentifier, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    summary = getMeetingSummary(id, meeting.organisation, meeting.meetingid)
    return {"summary": summary}


@app.post('/get-transcription')
async def getTranscription(meeting: MeetingIdentifier,
                           credentials: Annotated[str, Cookie()] = None) -> TranscriptionDetails:
    id = eatCookie(credentials)
    details = getMeetingTranscription(id, meeting.organisation, meeting.meetingid)
    return details


@app.post('/get-meeting-details')
async def getMeetingDetails(meeting: MeetingIdentifier,
                            credentials: Annotated[str, Cookie()] = None) -> MeetingDetails:
    id = eatCookie(credentials)
    details = getMeetingInfo(id, meeting.organisation, meeting.meetingid)
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


@app.delete('/delete-user')
async def deleteUser(credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    deleteUserByID(id)


@app.delete('/delete-org')
async def deleteOrg(organisation: OrganisationName, credentials: Annotated[str, Cookie()] = None):
    owner = eatCookie(credentials)
    deleteOrganisation(organisation.name, owner)


@app.delete('/delete-meet')
async def deleteMeet(meeting: MeetingIdentifier, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    deleteMeeting(meeting.organisation,meeting.meetingid, id)

@app.delete('/hard-delete-meet')
async def hardDeleteMeet(meeting: MeetingIdentifier, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    hardDeleteMeeting(meeting.organisation,meeting.meetingid, id)

@app.post('/update-name')
async def updateName(name: Name, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    updateUsername(id, name.name)


@app.post('/update-password')
async def updateName(password: Password, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    updatePassword(id, password.password)
