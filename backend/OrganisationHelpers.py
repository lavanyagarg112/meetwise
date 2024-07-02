from IOSchema import Organisation, Meeting
from database import mapOrgNameToID, mapOrgIDToName, mapTeamNameToId


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