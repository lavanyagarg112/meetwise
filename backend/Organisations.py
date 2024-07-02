from typing import List

from fastapi import HTTPException

from Enums import Roles
from IOSchema import Organisation, OrganisationReport, OrganisationPersonalReport, Person, Team, TeamPersonalReport, \
    TeamReport, OrgTeam, Meeting
from OrganisationHelpers import getOrganisationsByID, getOrganisationByName, getOrganisationByID, getTeamByName, \
    meetify
from UserAccounts import getUserByID
from database import mapOrgIDToName, mapOrgNameToID, getUserOrgs, getTeamsByOrg, getMeetingsByTeam, getMeetingsByOrg, \
    makeTeam, teamExists, addUserToTeam


def createOrganisation(OrganisationName: str, OwnerID: int) -> Organisation:
    # TODO: Implement new organisation logic
    # Database operations to create a new organisation
    if existsOrganisation(OrganisationName):
        raise HTTPException(status_code=400, detail="Organisation already exists")
    id = makeOrganisation(OwnerID,OrganisationName)
    return Organisation(name=OrganisationName, id=id)


def getOrganisationReport(UserID: int, OrganisationName: str) -> OrganisationPersonalReport:
    # TODO: Implement organisation report logic
    Organisation = getOrganisationByName(OrganisationName)
    teams = getTeamsById(Organisation)
    orgReport = OrganisationReport(id=Organisation, name=OrganisationName, owners=[Person(id=UserID, username="name")],
                                   admins=[Person(id=UserID + 1, username="adminGuy", email="admin@admin.com",
                                                  firstName="admin", lastName="Guy")],
                                   users=[Person(id=UserID + 2, username="userGuy", email="admin@user.com",
                                                 firstName="user", lastName="Guy")],
                                   teams=teams)
    report = OrganisationPersonalReport(isPermitted=True, userRole=Roles.USER, organisation=orgReport)
    return report


#TODO:
def getTeamReport(userID: int, teamName: str, organisationName: str) -> TeamPersonalReport:
    teamReport = TeamReport(id=1, name=teamName,
                            admins=[
                                Person(id=userID + 1, username="adminGuy", email="admin@admin.com", firstName="admin",
                                       lastName="Guy")],
                            users=[Person(id=userID + 2, username="userGuy", email="admin@user.com", firstName="user",
                                          lastName="Guy")],
                            otherUsers=[
                                Person(id=userID + 2, username="userGuy", email="admin@user.com", firstName="user",
                                       lastName="Guy")])
    report = TeamPersonalReport(isPermitted=True, userRole=Roles.USER, team=teamReport)
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


def getTeamsById(id:int) :
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


def getOrgs(userId: int) -> List[Organisation]:
    details = getUserOrgs(userId)
    mapper = lambda row: row[0]
    details = list(map(mapper, details))
    orgs = getOrganisationsByID(details)
    return orgs


def createTeam(orgteam: OrgTeam):
    org = getOrganisationByName(orgteam.organisation)
    if teamExists(org, orgteam.name) is not None:
        raise HTTPException(status_code=400, detail="Team already exists")
    makeTeam(org, orgteam.name)
    id = getTeamByName(org, orgteam.name)
