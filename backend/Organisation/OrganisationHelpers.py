from typing import List

from backend.States.Enums import Roles
from backend.States.Errors import AuthenticationError
from backend.States.IOSchema import Organisation, Meeting, Person, InviteOutput
from backend.database.database import mapOrgNameToID, mapOrgIDToName, mapTeamNameToId, getUserOrgs, getBulkUsersByIds, \
    getOrgRoleByID, getTeamRoleByID, getAll, \
    getUserDetailsByEmail, getInvites, getInvitesByUser, addUserToOrg, getStatusOrg, getStatusTeam, inOrg, removeUser


def getOrganisationsByID(orgIds: [int] = None) -> [Organisation]:
    if orgIds is None:
        return None
    else:
        mapper = lambda row: Organisation(id=row[0], name=row[1])
        details = mapOrgIDToName(orgIds)
        orgs = list(map(mapper, details))
        return orgs


def getOrganisationsByName(orgIds: [str] = None) -> [Organisation]:
    if orgIds is None:
        return None
    else:
        mapper = lambda row: Organisation(id=row[0], name=row[1])
        details = mapOrgNameToID(orgIds)
        orgs = list(map(mapper, details))
        return orgs


def getOrganisationByID(orgIds: int = None) -> str | None:
    if orgIds is None:
        return None
    else:
        details = getOrganisationsByID([orgIds])
        if details is None:
            return None
        return details[0].name


def getOrganisationByName(orgIds: str = None) -> int | None:
    if orgIds is None:
        return None
    else:
        details = getOrganisationsByName([orgIds])
        if not details:
            return None
        return details[0].id


def getOrgs(userId: int) -> List[Organisation]:
    details = getUserOrgs(userId)
    mapper = lambda row: row[0]
    details = list(map(mapper, details))
    orgs = getOrganisationsByID(details)
    return orgs


def getTeamByName(orgId: int, teamName: str = None) -> int | None:
    if teamName is None:
        return None
    return mapTeamNameToId(orgId, teamName)[0]


def meetify(meetings: [Meeting]):
    mapper = lambda row: Meeting(id=row[0], title=row[1], date=row[2].replace('T', ' '), )
    meetings = list(map(mapper, meetings))
    return meetings


def getUsersByIds(userIds: [int]) -> List[Person]:
    mapper = lambda row: Person(id=row[0], username=row[1], email=row[2], firstName=row[3], lastName=row[4])
    details = getBulkUsersByIds(userIds)
    users = list(map(mapper, details))
    return users


def getStatus(orgId: int, status: Roles) -> List[Person]:
    details = getStatusOrg(orgId, status)
    if not details:
        return []
    mapper = lambda row: row[0]
    details = list(map(mapper, details))
    return getUsersByIds(details)


def getRoleByID(orgId: int, userId: int) -> Roles:
    x = getOrgRoleByID(orgId, userId)
    if not x:
        AuthenticationError("User does not belong to this organisation")
    else:
        return Roles(x[0])


def getTeamStatus(orgId: int, teamId: int, status: Roles) -> List[Person]:
    details = getStatusTeam(orgId, teamId, status)
    if not details:
        return []
    mapper = lambda row: row[0]
    details = list(map(mapper, details))
    return getUsersByIds(details)


def getAllUsers(orgId: int, teamId: int) -> List[Person]:
    details = getAll(orgId, teamId)
    if not details:
        return []
    mapper = lambda row: row[0]
    details = list(map(mapper, details))
    return getUsersByIds(details)


def getTRoleByID(orgId: int, teamId: int, userId: int) -> str | None:
    res = getTeamRoleByID(orgId, teamId, userId)
    if not res:
        return None
    else:
        return res[0]


def getPendingInvites(organisation: int) -> List[InviteOutput]:
    details = getInvites(organisation)
    if not details:
        return []
    mapper = lambda row: InviteOutput(id=row[0], email=row[1], role=row[2])
    details = list(map(mapper, details))
    return details


def forceJoin(email: str):
    details = getInvitesByUser(email)
    id = getUserDetailsByEmail(email)[0]
    if not details:
        return []
    mapper = lambda row: addUserToOrg(orgId=row[0], userId=id, role=row[1])
    details = list(map(mapper, details))


def isUserInOrg(userId: int, orgId: int) -> bool:
    return inOrg(userId, orgId) is not None

