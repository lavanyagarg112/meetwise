import enum
from typing import List

from pydantic import BaseModel

from Enums import Roles


class Organisation(BaseModel):
    id: int
    name: str


class Team(BaseModel):
    id: int
    name: str


class Person(BaseModel):
    id: int
    username: str


class UserLogIn(BaseModel):
    email: str
    password: str


class UserSignUp(UserLogIn):
    firstName: str
    lastName: str
    username: str
    email: str
    password: str


class UserDetails(Person):
    id: int
    email: str
    username: str
    firstName: str


class UserInfo(BaseModel):
    user: UserDetails
    activeOrganisation: str


class OrganisationReport(BaseModel):
    id: int
    name: str
    owners: List[Person]
    admins: List[Person] = None
    users: List[Person] = None
    teams: List[Team] = None


class OrganisationPersonalReport(BaseModel):
    isPermitted: bool
    userRole: Roles
    organisation: OrganisationReport
