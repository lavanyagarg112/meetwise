import enum
from datetime import datetime
from typing import List, Optional, Literal, Annotated

from fastapi import UploadFile, Form
from pydantic import BaseModel

from Enums import Roles


class InviteInput(BaseModel):
    email: str
    role: Roles
    organisation: str


class InviteOutput(BaseModel):
    id: int
    email: str
    role: Roles


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
    pendingInvites: List[InviteOutput] = None  #Uncool people


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
    userRole: str
    team: TeamReport


class Meeting(BaseModel):
    id: int
    title: str
    date: str


class MeetingIdentifier(BaseModel):
    meetingid: int
    organisation: str


class Transcription(MeetingIdentifier):
    transcription: str


class TranscriptionDetails(BaseModel):
    type: bool
    transcription: str
    uncommonWords: List[str]


class MeetingInput(BaseModel):
    file: UploadFile
    type: Literal["organisation", "team"]
    meetingName: str
    meetingDate: datetime
    team: str | None = None
    organisation: str


class AddUserInput(BaseModel):
    teamName: str
    organisation: str
    userId: int
    role: str


class MeetingDetails(Meeting):
    type: Literal["organisation", "team"]
    team: str | None = None
    transcriptionGenerated: bool
