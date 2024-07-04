from datetime import datetime

from fastapi import FastAPI, HTTPException, Response, Request, Cookie, UploadFile, Form, File
from typing import Annotated, Literal
from IOSchema import UserSignUp, UserLogIn, Organisation, OrganisationPersonalReport, OrganisationName, \
    OrganisationNameOptional, OrgTeam, TeamPersonalReport, Team, Person, InviteInput, MeetingInput, AddUserInput
from UserAccounts import createUser, getUserDetails, getUserByID, getOrganisationsByID, \
    setOrganisationActive, eatCookie, bakeCookie, inviteOrAddUser
from Organisations import createOrganisation, getOrganisationReport, getTeamReport, getMeetings, getAllMeetings, \
    getTeams, addUser, createTeam
from fastapi.middleware.cors import CORSMiddleware

from Meetings import storeMeeting
from Enums import Roles
from OrganisationHelpers import getRoleByID, getOrganisationByName

app = FastAPI()

origins = "http://localhost:.*"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["null"],
    allow_origin_regex=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


#TODO : add return types
@app.post("/sign-up")
async def signup(user: UserSignUp, response: Response):
    try:
        userCred, error = createUser(user)
        if error is not None:
            return {"error": error}, 400
            # The calls are separated to ensure data is actually written to DB successfully,
            #  after DB testing can merge them into 1 like current implementation
    except:
        raise HTTPException(status_code=500, detail="Internal Server Error while logging in.")
    userDetails, error, activeOrg = getUserDetails(userCred)
    bakeCookie(userDetails.id, response)
    return {"user": userDetails}


@app.post("/sign-in")
async def signin(user: UserLogIn, response: Response):
    if user.email is None and user.username is None:
        raise HTTPException(status_code=400, detail="Invalid credentials. Please supply username or email.")
    try:
        userDetails, error, activeOrganisation = getUserDetails(user)
        if error is not None:
            return {"error": error}, 401
    except:
        raise HTTPException(status_code=500, detail="Internal Server Error while logging in.")
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
                        type: Annotated[Literal["organisation", "team"],Form()],
                        meetingName: Annotated[str,Form()],
                        meetingDate: Annotated[datetime,Form()],
                        organisation: Annotated[str,Form()],
                        team: Annotated[str | None,Form()] = None,
                        credentials: Annotated[str, Cookie()] = None):
    input = MeetingInput(file=file, type=type, meetingName=meetingName, meetingDate=meetingDate, team=team,
                         organisation=organisation)
    id = eatCookie(credentials)
    storeMeeting(input)


@app.post("/new-team")
async def newTeam(orgteam: OrgTeam, credentials: Annotated[str, Cookie()] = None) -> Team:
    id = eatCookie(credentials)
    id = createTeam(id, orgteam)
    return Team(id=id, name=orgteam.name)


@app.post("/get-team-meetings")
async def getTeamMeetings(orgteam: OrgTeam, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    meetings = getMeetings(orgteam)
    return {"teams": meetings}


@app.post("/get-organisation-meetings")
async def getOrganisationMeetings(name: OrganisationName, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    meetings = getAllMeetings(name.name)
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
async def getUserRole(org : OrganisationName, credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    org = getOrganisationByName(org.name)
    role = getRoleByID(org,id)
    return {"role": role}


@app.post('/add-team-user')
async def addTeamUser(input: AddUserInput,
                      credentials: Annotated[str, Cookie()] = None) -> Person:
    id = eatCookie(credentials)
    user: Person = addUser(input.organisation, input.userId, input.role, input.teamName)
    return user


@app.post('/invite-user')
async def inviteUser(input: InviteInput, credentials: Annotated[str, Cookie()] = None):
    output = inviteOrAddUser(input.email, input.role.value, input.organisation)
    return output


@app.get('/logout')
async def logout(response: Response):
    response.delete_cookie("credentials", httponly=True, secure=True, samesite="none")
