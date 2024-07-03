from fastapi import FastAPI, HTTPException, Response, Request, Cookie, UploadFile
from typing import Annotated
from IOSchema import UserSignUp, UserLogIn, Organisation, OrganisationPersonalReport, OrganisationName, \
    OrganisationNameOptional, OrgTeam, TeamPersonalReport, Team, Person, InviteInput, MeetingInput
from UserAccounts import createUser, getUserDetails, getUserByID, getOrganisationsByID, \
    setOrganisationActive, eatCookie, bakeCookie, inviteOrAddUser
from Organisations import createOrganisation, getOrganisationReport, getTeamReport, getMeetings, getAllMeetings, \
    getTeams, addUser, createTeam
from fastapi.middleware.cors import CORSMiddleware

from Enums import Roles

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
    id :int = eatCookie(credentials)
    teamReport: TeamPersonalReport = getTeamReport(id, orgteam.name, orgteam.organisation)
    return teamReport


#TODO:
@app.post("/upload-meeting")
async def uploadMeeting(input : MeetingInput,
                        credentials: Annotated[str, Cookie()] = None):
    id = eatCookie(credentials)
    # TODO: Implement upload meeting logic
    pass


@app.post("/new-team")
async def newTeam(orgteam: OrgTeam, credentials: Annotated[str, Cookie()] = None) -> Team:
    id = eatCookie(credentials)
    id = createTeam(id,orgteam)
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
    teams = getTeams(name.name)
    return {"teams": teams}


@app.post('/add-team-user')
async def addTeamUser(teamName: str, organisation: str, userId: int, role: str,
                      credentials: Annotated[str, Cookie()] = None) -> Person:
    id = eatCookie(credentials)
    user: Person = addUser(organisation, userId, role, teamName)
    return user


#TODO:
@app.post('/invite-user')
async def inviteUser(input : InviteInput, credentials: Annotated[str, Cookie()] = None):
    output = inviteOrAddUser(input.email, input.role.value,input.organisation)
    return output
