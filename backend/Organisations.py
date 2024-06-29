from Enums import Roles
from IOSchema import Organisation, OrganisationReport, OrganisationPersonalReport, Person, Team


def createOrganisation(OrganisationName: str, OwnerID: int) -> Organisation:
    # TODO: Implement new organisation logic
    # Database operations to create a new organisation
    return Organisation(name=OrganisationName, id=1)


def getOrganisationReport(UserID: int, OrganisationName: str) -> OrganisationPersonalReport:
    # TODO: Implement organisation report logic
    orgReport = OrganisationReport(id=1, name=OrganisationName, owners=[Person(id=UserID, username="name")],
                                   admins=[Person(id=UserID + 1, username="adminGuy")],
                                   users=[Person(id=UserID + 2, username="userGuy")],
                                   teams=[Team(id=UserID + 3, name="SampleTeam")])
    report = OrganisationPersonalReport(isPermitted=True, userRole=Roles.USER, organisation=orgReport)
    return report
