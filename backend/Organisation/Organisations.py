from typing import List

from fastapi import HTTPException

from backend.Organisation.OrganisationHelpers import getOrganisationByName, getTeamByName, \
    meetify, getRoleByID, getTRoleByID, getPendingInvites, getStatus, isUserInOrg, removeUserUnchecked
from backend.Organisation.Team import getTeamsById
from backend.Profile.UserAccounts import getUserByID
from backend.States.Enums import Roles
from backend.States.Errors import AuthenticationError
from backend.States.IOSchema import Organisation, OrganisationReport, OrganisationPersonalReport, Person, OrgTeam, \
    Meeting, InviteOutput
from backend.database.database import getMeetingsByTeam, \
    getMeetingsByOrg, \
    addUserToTeam, existsOrganisation, makeOrganisation, getOwner, addUserToOrg, \
    setActiveOrganisation, deleteOrganisationByID


def createOrganisation(OrganisationName: str, OwnerID: int) -> Organisation:
    if existsOrganisation(OrganisationName):
        raise HTTPException(status_code=400, detail="Organisation already exists")
    id = makeOrganisation(OwnerID, OrganisationName)
    addUserToOrg(orgId=id, userId=OwnerID, role="owner")
    setActiveOrganisation(OwnerID, id)
    return Organisation(name=OrganisationName, id=id)


def deleteOrganisation(name: str, OwnerID: int):
    id = getOrganisationByName(name)
    if not id:
        raise HTTPException(status_code=404, detail="Organisation not found")
    if getOwner(id)[0] != OwnerID:
        raise HTTPException(status_code=403, detail="User is not authorised to delete organisation")
    deleteOrganisationByID(id)


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


def getMeetings(userId: int, orgTeam: OrgTeam):
    org: int = getOrganisationByName(orgTeam.organisation)
    team: int = getTeamByName(org, orgTeam.name)
    if not getTRoleByID(org, team, userId):
        AuthenticationError("You can only see your own team's meetings")
    meetings = getMeetingsByTeam(org, team)
    return meetify(meetings)


def getAllMeetings(userId: int, orgName: str) -> [Meeting]:
    orgName = getOrganisationByName(orgName)
    if not isUserInOrg(userId, orgName):
        AuthenticationError("You can only see your own organisation's meetings")
    meetings = getMeetingsByOrg(orgName)
    return meetify(meetings)


def addUser(id: int, organisation: str, userId: int, role: str, teamName: str = None) -> Person:
    organisation = getOrganisationByName(organisation)
    teamName = getTeamByName(organisation, teamName)
    if getRoleByID(organisation, id) == Roles.USER.value and getTRoleByID(organisation, teamName,
                                                                          id) == Roles.USER.value:
        AuthenticationError("Users cannot add other users to teams.")
    addUserToTeam(organisation, userId, role, teamName, role)
    user = getUserByID(userId).user
    return Person(id=userId, username=user.username, email=user.email, firstName=user.firstName, lastName=user.lastName)


def removeUserOrg(userId: int, org: str, remover: int):
    """
    Removes user from the organisation
    if user is  remover, user just quits the organisation
    :param userId: user to be removed
    :param org: organisation to remove user from
    :param remover: admin removing user
    """
    org: int = getOrganisationByName(org)
    if not org:
        raise HTTPException(status_code=404, detail="Organisation not found")

    role = (getRoleByID(org, remover))
    if role is None:
        raise HTTPException(status_code=404, detail=f"User {remover} not in organisation")
    if remover != userId and role == Roles.USER:
        raise HTTPException(status_code=403, detail="User is not authorised to remove user")
    if not isUserInOrg(userId, org):
        raise HTTPException(status_code=404, detail=f"User {userId} not in organisation")

    if userId == remover:
        #TODO: do proper logging
        print(f"User {userId} has left the organisation {org}")
    else:
        print(f"User {userId} has been removed from the organisation {org} by User {remover}")
    removeUserUnchecked(userId, org)
