from IOSchema import Organisation
from database import mapOrgNameToID, mapOrgIDToName


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
        details = getOrganisationsByName(orgIds)
        if details is None:
            return None
        return details[0].id


def getTeamByName(orgId: int, teamName: str = None) -> int | None:
    if teamName is None:
        return None
    return mapTeamNameToId(orgId, teamName)[0]


def meetify(meetings: [Meeting]):
    mapper = lambda row: Meeting(id=row[0], title=row[1], date=row[2])
    meetings = list(map(mapper, meetings))
    return meetings
