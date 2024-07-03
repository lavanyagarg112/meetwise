import enum
from datetime import datetime
from typing import List, Optional

from fastapi import UploadFile
from pydantic import BaseModel

from Enums import Roles


class Organisation(BaseModel):
    id: int
    name: str


class Team(BaseModel):
    id: int
    name: str


class OrgTeam(BaseModel):
    name: str
    organisation: str


class Person(BaseModel):
    id: int
    email: str
    username: str
    firstName: str
    lastName: str


class OrganisationName(BaseModel):
    name: str


class OrganisationNameOptional(BaseModel):
    name: str = None


class UserLogIn(BaseModel):
    username: str = None
    email: str = None
    password: str


class UserSignUp(UserLogIn):
    firstName: str
    lastName: str


class UserInfo(BaseModel):
    user: Person
    activeOrganisation: str | None = None


class OrganisationReport(Organisation):
    owners: List[Person]
    admins: List[Person] = None
    users: List[Person] = None
    teams: List[Team] = None


class OrganisationPersonalReport(BaseModel):
    isPermitted: bool
    userRole: Roles
    organisation: OrganisationReport


class TeamReport(Team):
    admins: List[Person] = None
    users: List[Person] = None
    otherUsers: List[Person] = None


class TeamPersonalReport(BaseModel):
    isPermitted: bool
    userRole: Roles
    team: TeamReport


class Meeting(BaseModel):
    id: int
    title: str
    date: datetime


class MeetingInput(BaseModel):
    file: UploadFile
    type: str
    meetingName: str
    meetingDate: datetime


class InviteInput(BaseModel):
    email: str
    role: Roles
    organisation: str


class InviteOutput(BaseModel):
    id: int
    email: str
    role: Roles

class InviteInput(BaseModel):
    organisation: str
    email: str
    role: Roles

class UploadMeeting(BaseModel):
    file: UploadFile
    type: str
    meetingName: str 
    organisation: str 
    team: str | None = None
    meetingDate: str