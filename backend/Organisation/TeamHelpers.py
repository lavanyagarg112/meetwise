from backend.States.Enums import Roles
from backend.States.IOSchema import Team
from backend.database.database import getTeamsByOrg, getTeamsByOrgStatus


def getTeamsById(id: int, UserId: int, status: Roles | None = None):
    if not status:
        teams = getTeamsByOrg(id, UserId)
    else:
        teams = getTeamsByOrgStatus(id, UserId, status)
    teammer = lambda row: Team(id=row[0], name=row[1])
    teams = list(map(teammer, teams))
    return teams