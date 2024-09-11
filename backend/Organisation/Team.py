from fastapi import HTTPException

from backend.Organisation.OrganisationHelpers import getOrganisationByName, getTeamByName, \
    getRoleByID, getTRoleByID, getAllUsers, getTeamStatus, isUserInOrg
from backend.Organisation.TeamHelpers import getTeamsById
from backend.States.Enums import Roles
from backend.States.Errors import AuthenticationError
from backend.States.IOSchema import Person, TeamPersonalReport, \
    TeamReport, OrgTeam
from backend.database.database import makeTeam, teamExists, addUserToTeam, getOwner, removeTeamUser


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


def getTeams(name: str, Userid: int, status: Roles | None = None):
    id = getOrganisationByName(name)
    if not isUserInOrg(Userid, id):
        AuthenticationError("You can only see your own organisation's teams")
    return getTeamsById(id, Userid, status)


'''
⚠️ if TeamControl is enabled and existing user is added they lose their powers
'''


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


def removeUserTeam(userId: int, orgteam: OrgTeam, remover: int):
    """
    Removes user from the organisation
    if user is  remover, user just quits the organisation
    :param orgteam: pair of team and its org to remove user from
    :param userId: user to be removed
    :param remover: admin removing user
    """
    org: int = getOrganisationByName(orgteam.organisation)
    if not org:
        raise HTTPException(status_code=404, detail="Organisation not found")

    role = (getRoleByID(org, remover))
    if role is None:
        raise HTTPException(status_code=404, detail=f"User {remover} not in organisation")
    if remover != userId and role == Roles.USER:
        raise HTTPException(status_code=403, detail="User is not authorised to remove user")
    if not isUserInOrg(userId, org):
        raise HTTPException(status_code=404, detail=f"User {userId} not in organisation")

    team: int = getTeamByName(org, orgteam.name)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    #TODO:check for team membership
    if userId == remover:
        #TODO: do proper logging
        print(f"User {userId} has left the team {orgteam.name} in organisation {org}")
    else:
        print(f"User {userId} has been removed from the team {orgteam.name} in organisation {org} by User {remover}")
    removeTeamUser(userId, org, team)
