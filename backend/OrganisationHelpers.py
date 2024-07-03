from typing import List

from backend.Enums import Roles
from backend.Errors import AuthenticationError
from backend.IOSchema import Organisation, Meeting, Person
from backend.database import mapOrgNameToID, mapOrgIDToName, mapTeamNameToId, getUserOrgs, getBulkUsersByIds, \
    getAdminsOrg, getUsersOrg, getOrgRoleByID, getTeamRoleByID, getAdminsTeam, getUsersTeam, getOutsideTeam


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
    mapper = lambda row: Meeting(id=row[0], title=row[1], date=row[2])
    meetings = list(map(mapper, meetings))
    return meetings


def getUsersByIds(userIds: [int]) -> List[Person]:
    mapper = lambda row: Person(id=row[0], username=row[1], email=row[2], firstName=row[3], lastName=row[4])
    details = getBulkUsersByIds(userIds)
    users = list(map(mapper, details))
    return users


def getAdmins(orgId: int) -> List[Person]:
    details = getAdminsOrg(orgId)
    if not details:
        return []
    mapper = lambda row: row[0]
    details = list(map(mapper, details))
    return getUsersByIds(details)


def getRoleByID(orgId: int, userId: int) -> Roles:
    if not getOrgRoleByID(orgId, userId):
        AuthenticationError("User does not belong to this organisation")
    else:
        return Roles(getOrgRoleByID(orgId, userId)[0])


def getUsers(orgId: int) -> List[Person]:
    details = getUsersOrg(orgId)
    if not details:
        return []
    mapper = lambda row: row[0]
    details = list(map(mapper, details))
    return getUsersByIds(details)


def getTeamAdmins(orgId: int, teamId: int) -> List[Person]:
    details = getAdminsTeam(orgId, teamId)
    if not details:
        return []
    mapper = lambda row: row[0]
    details = list(map(mapper, details))
    return getUsersByIds(details)


def getTeamUsers(orgId: int, teamId: int) -> List[Person]:
    details = getUsersTeam(orgId, teamId)
    if not details:
        return []
    mapper = lambda row: row[0]
    details = list(map(mapper, details))
    return getUsersByIds(details)


def getOthers(orgId: int, teamId: int) -> List[Person]:
    details = getOutsideTeam(orgId, teamId)
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
