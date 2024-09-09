from typing import List

from fastapi import HTTPException

from backend.States.Enums import Roles
from backend.States.IOSchema import Organisation, OrganisationReport, OrganisationPersonalReport, Person, Team, TeamPersonalReport, \
    TeamReport, OrgTeam, Meeting, InviteOutput, MeetingInput
from backend.Organisation.OrganisationHelpers import getOrganisationsByID, getOrganisationByName, getOrganisationByID, getTeamByName, \
    meetify, getRoleByID, getTRoleByID, getAllUsers, getPendingInvites, getStatus, getTeamStatus
from backend.Profile.UserAccounts import getUserByID
from backend.States.Errors import AuthenticationError
from backend.database.database import mapOrgIDToName, mapOrgNameToID, getUserOrgs, getTeamsByOrg, getMeetingsByTeam, getMeetingsByOrg, \
    makeTeam, teamExists, addUserToTeam, existsOrganisation, makeOrganisation, getOwner, addUserToOrg, \
    getTeamsByOrgStatus, setActiveOrganisation


def createOrganisation(OrganisationName: str, OwnerID: int) -> Organisation:
    if existsOrganisation(OrganisationName):
        raise HTTPException(status_code=400, detail="Organisation already exists")
    id = makeOrganisation(OwnerID, OrganisationName)
    addUserToOrg(orgId=id, userId=OwnerID, role="owner")
    setActiveOrganisation(OwnerID, id)
    return Organisation(name=OrganisationName, id=id)


def getOrganisationReport(UserID: int, OrganisationName: str) -> OrganisationPersonalReport:
    organisation: int = getOrganisationByName(OrganisationName)
    if organisation is None:
        raise HTTPException(status_code=404, detail="Organisation not found")
    teams = getTeamsById(organisation, UserID)
    owner: int = getOwner(organisation)[0]
    owner: Person = getUserByID(owner).user
    admins: [Person] = getStatus(organisation, Roles.ADMIN)
    users: [Person] = getStatus(organisation, Roles.USER)
    userRole = getRoleByID(organisation, UserID)
    pendingInvites: List[InviteOutput] = getPendingInvites(organisation)
    orgReport = OrganisationReport(id=organisation, name=OrganisationName, owners=[owner],
                                   admins=admins,
                                   users=users,
                                   teams=teams, pendingInvites=pendingInvites)
    report = OrganisationPersonalReport(isPermitted=True, userRole=userRole, organisation=orgReport)
    return report


def getTeamReport(userID: int, teamName: str, organisationName: str) -> TeamPersonalReport:
    organisation = getOrganisationByName(organisationName)
    team: int = getTeamByName(orgId=organisation, teamName=teamName)
    userRole = getTRoleByID(organisation, team, userID)
    if not userRole:
        AuthenticationError("User is not in team")
    admins: [Person] = getTeamStatus(organisation, team, Roles.ADMIN)
    users: [Person] = getTeamStatus(organisation, team, Roles.USER)
    allUsers: [Person] = getAllUsers(organisation, team)
    otherUsers = filter(lambda x: (x not in users) and (x not in admins), allUsers)
    teamReport = TeamReport(id=team, name=teamName,
                            admins=admins,
                            users=users,
                            otherUsers=otherUsers)
    report = TeamPersonalReport(isPermitted=True, userRole=userRole, team=teamReport)
    return report


def getMeetings(userId: int, orgTeam: OrgTeam):
    org: int = getOrganisationByName(orgTeam.organisation)
    team: int = getTeamByName(org, orgTeam.name)
    if not getTRoleByID(org, team, userId):
        AuthenticationError("You can only see your own team's meetings")
    meetings = getMeetingsByTeam(org, team)
    return meetify(meetings)


def getAllMeetings(userId: int, orgName: str) -> [Meeting]:
    orgName = getOrganisationByName(orgName)
    if not getRoleByID(orgName, userId):
        AuthenticationError("You can only see your own organisation's meetings")
    meetings = getMeetingsByOrg(orgName)
    return meetify(meetings)


def getTeamsById(id: int, UserId: int, status: Roles | None = None):
    if not status:
        teams = getTeamsByOrg(id, UserId)
    else:
        teams = getTeamsByOrgStatus(id, UserId, status)
    teammer = lambda row: Team(id=row[0], name=row[1])
    teams = list(map(teammer, teams))
    return teams


def getTeams(name: str, Userid: int, status: Roles | None = None):
    id = getOrganisationByName(name)
    if not getRoleByID(id, Userid):
        AuthenticationError("You can only see your own organisation's teams")
    return getTeamsById(id, Userid, status)


'''
⚠️ if TeamControl is enabled and existing user is added they lose their powers
'''


def addUser(id:int,organisation: str, userId: int, role: str, teamName: str = None) -> Person:
    organisation = getOrganisationByName(organisation)
    teamName = getTeamByName(organisation, teamName)
    if getRoleByID(organisation,id) == Roles.USER.value and getTRoleByID(organisation,teamName,id) == Roles.USER.value:
        AuthenticationError("Users cannot add other users to teams.")
    addUserToTeam(organisation, userId, role, teamName, role)
    user = getUserByID(userId).user
    return Person(id=userId, username=user.username, email=user.email, firstName=user.firstName, lastName=user.lastName)


def createTeam(userId: int, orgteam: OrgTeam):
    org = getOrganisationByName(orgteam.organisation)
    if teamExists(org, orgteam.name) is not None:
        raise HTTPException(status_code=400, detail="Team already exists")
    if getRoleByID(org, userId) == Roles.USER.value:
        raise HTTPException(status_code=403, detail="User is not authorized to create team")
    makeTeam(org, orgteam.name)
    id = getTeamByName(org, orgteam.name)
    owner = getOwner(org)[0]
    addUserToTeam(org, owner, Roles.ADMIN.value, id, Roles.ADMIN.value)
    addUserToTeam(org, userId, Roles.ADMIN.value, id, Roles.ADMIN.value)
    return id
