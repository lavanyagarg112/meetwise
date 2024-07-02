from typing import List

from Enums import Roles
from IOSchema import Organisation, OrganisationReport, OrganisationPersonalReport, Person, Team, TeamPersonalReport, \
    TeamReport, OrgTeam, Meeting
from backend.OrganisationHelpers import getOrganisationsByID, getOrganisationByName
from database import mapOrgIDToName, mapOrgNameToID, getUserOrgs, getTeamsByOrg


def createOrganisation(OrganisationName: str, OwnerID: int) -> Organisation:
    # TODO: Implement new organisation logic
    # Database operations to create a new organisation
    return Organisation(name=OrganisationName, id=1)


def getOrganisationReport(UserID: int, OrganisationName: str) -> OrganisationPersonalReport:
    # TODO: Implement organisation report logic
    orgReport = OrganisationReport(id=1, name=OrganisationName, owners=[Person(id=UserID, username="name")],
                                   admins=[Person(id=UserID + 1, username="adminGuy", email="admin@admin.com",
                                                  firstName="admin", lastName="Guy")],
                                   users=[Person(id=UserID + 2, username="userGuy", email="admin@user.com",
                                                 firstName="user", lastName="Guy")],
                                   teams=[Team(id=UserID + 3, name="SampleTeam")])
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
    # TODO: Implement meeting logic
    return [Meeting(id=1, title="4", date="2024-06-01")]


def getAllMeetings(orgName: str):
    # TODO: Implement meeting logic
    return [Meeting(id=1, title="4", date="2024-06-01")]


def getTeams(name=str):
    teams = getTeamsByOrg(getOrganisationByName(name))
    teammer = lambda row: Team(id=row[0], name=row[1])
    teams = list(map(teammer, teams))
    return teams


def addUser(teamName: str, organisation: str, userId: int, role: str) -> Person:
    # TODO: Implement user logic
    return Person(id=userId, username="userGuy", email="admin@user.com", firstName="user", lastName="Guy")


def getOrgs(userId: int) -> List[Organisation]:
    details = getUserOrgs(userId)
    mapper = lambda row: row[0]
    details = list(map(mapper, details))
    orgs = getOrganisationsByID(details)
    return orgs
