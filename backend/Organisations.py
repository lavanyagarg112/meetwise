from typing import List

from fastapi import HTTPException

from Enums import Roles
from IOSchema import Organisation, OrganisationReport, OrganisationPersonalReport, Person, Team, TeamPersonalReport, \
    TeamReport, OrgTeam, Meeting
from OrganisationHelpers import getOrganisationsByID, getOrganisationByName, getOrganisationByID, getTeamByName, \
    meetify, getAdmins, getUsers, getRoleByID, getTeamAdmins, getTeamUsers, getOthers, getTRoleByID
from UserAccounts import getUserByID
from database import mapOrgIDToName, mapOrgNameToID, getUserOrgs, getTeamsByOrg, getMeetingsByTeam, getMeetingsByOrg, \
    makeTeam, teamExists, addUserToTeam, existsOrganisation, makeOrganisation, getOwner, addUserToOrg


def createOrganisation(OrganisationName: str, OwnerID: int) -> Organisation:
    if existsOrganisation(OrganisationName):
        raise HTTPException(status_code=400, detail="Organisation already exists")
    id = makeOrganisation(OwnerID, OrganisationName)
    addUserToOrg(orgId=id, userId=OwnerID, role="owner")
    return Organisation(name=OrganisationName, id=id)


def getOrganisationReport(UserID: int, OrganisationName: str) -> OrganisationPersonalReport:
    organisation: int = getOrganisationByName(OrganisationName)
    if organisation is None:
        raise HTTPException(status_code=404, detail="Organisation not found")
    teams = getTeamsById(organisation)
    owner: int = getOwner(organisation)[0]
    owner: Person = getUserByID(owner).user
    admins: [Person] = getAdmins(organisation)
    users: [Person] = getUsers(organisation)
    userRole = getRoleByID(organisation, UserID)
    orgReport = OrganisationReport(id=organisation, name=OrganisationName, owners=[owner],
                                   admins=admins,
                                   users=users,
                                   teams=teams)
    report = OrganisationPersonalReport(isPermitted=True, userRole=userRole, organisation=orgReport)
    return report


def getTeamReport(userID: int, teamName: str, organisationName: str) -> TeamPersonalReport:
    organisation = getOrganisationByName(organisationName)
    team: int = getTeamByName(organisation, teamName)
    admins: [Person] = getTeamAdmins(organisation, team)
    users: [Person] = getTeamUsers(organisation, team)
    otherUsers: [Person] = getOthers(organisation, team)
    userRole = getTRoleByID(organisation, team, userID)
    if type(userRole) == tuple:
        userRole = userRole[0]
    print('ROLE: ', userRole)
    teamReport = TeamReport(id=team, name=teamName,
                            admins=admins,
                            users=users,
                            otherUsers=otherUsers)
    report = TeamPersonalReport(isPermitted=True, userRole=userRole, team=teamReport)
    return report


def getMeetings(orgTeam: OrgTeam):
    org: int = getOrganisationByName(orgTeam.organisation)
    team: int = getTeamByName(org, orgTeam.name)
    meetings = getMeetingsByTeam(org, team)
    return meetify(meetings)


def getAllMeetings(orgName: str) -> [Meeting]:
    orgName = getOrganisationByName(orgName)
    meetings = getMeetingsByOrg(orgName)
    return meetify(meetings)


def getTeamsById(id: int):
    teams = getTeamsByOrg(id)
    teammer = lambda row: Team(id=row[0], name=row[1])
    teams = list(map(teammer, teams))
    return teams


def getTeams(name: str):
    id = getOrganisationByName(name)
    return getTeamsById(id)


'''
⚠️ if TeamControl is enabled and existing user is added they lose their powers
'''


def addUser(organisation: str, userId: int, role: str, teamName: str = None) -> Person:
    organisation = getOrganisationByName(organisation)
    teamName = getTeamByName(organisation, teamName)
    addUserToTeam(organisation, userId, role, teamName)
    user = getUserByID(userId).user
    return Person(id=userId, username=user.username, email=user.email, firstName=user.firstName, lastName=user.lastName)


def createTeam(userId:int, orgteam: OrgTeam):
    org = getOrganisationByName(orgteam.organisation)
    if teamExists(org, orgteam.name) is not None:
        raise HTTPException(status_code=400, detail="Team already exists")
    makeTeam(org, orgteam.name)
    id = getTeamByName(org, orgteam.name)
    addUserToTeam(org,userId,Roles.ADMIN.value, id)
    return id
