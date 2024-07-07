from typing import List, Tuple
from fastapi import HTTPException
from func_timeout import func_timeout, FunctionTimedOut
from mutagen.mp3 import MP3
from IOSchema import MeetingInput, TranscriptionDetails, MeetingDetails
from OrganisationHelpers import getOrganisationByName, getTeamByName, getRoleByID, getTRoleByID
from audio_transcription import transcribe
from Meeting import Meeting, Task
from Todos import replaceTodos
from Enums import Roles
from Errors import AuthenticationError
from database import storeMeetingDetailsTeam, storeMeetingDetailsOrg, getSummary, updateMeetingDetails, \
    getTranscription, getMeetingMetaData, addBulkTodos, addBulkTodosTeam, getTeamById

time = 300  #timeout


def storeMeeting(userId: int, meeting: MeetingInput):
    file = meeting.file
    if file.content_type != 'audio/mpeg':
        raise HTTPException(status_code=415,
                            detail=f'''Unsupported media type. Only Audio files are supported.Received {file.content_type} "
                                   instead''')

    org = getOrganisationByName(meeting.organisation)
    if meeting.type == "organisation" and getRoleByID(org, userId) == Roles.USER.value:
        AuthenticationError("Only Admins can upload meetings.")
    team = None
    if meeting.type == 'team':
        team = getTeamByName(org, meeting.team)

    if meeting.type == "team" and getTRoleByID(org, team, userId) == Roles.USER.value:
        AuthenticationError("Only Admins can upload meetings.")
    size = file.size
    file = file.file
    length = int(MP3(file).info.length)
    try:
        transcription = func_timeout(time, transcribe, (file,))
    except FunctionTimedOut:
        raise HTTPException(status_code=500, detail="Transcription timed out. Please use a smaller file or try again.")
    except:
        raise HTTPException(status_code=500, detail="Transcription failed.")
    meetingMeta = Meeting(transcription)
    try:
        summary = func_timeout(time, meetingMeta.generate_summary)
    except FunctionTimedOut:
        summary = "Summary timed out. Please use a smaller file or try again."
    uncommonWords = ",".join(meetingMeta.generate_uncommon_words())

    if meeting.type == 'team':
        id = storeMeetingDetailsTeam(org=org, name=meeting.meetingName, team=team, transcription=transcription,
                                     length=length, date=meeting.meetingDate.strftime('%Y-%m-%d %H:%M:%S'),
                                     summary=summary,
                                     size=size, uncommon=uncommonWords)
    else:
        id = storeMeetingDetailsOrg(org=org, name=meeting.meetingName, transcription=transcription, length=length,
                                    date=meeting.meetingDate.strftime('%Y-%m-%d %H:%M:%S'), summary=summary, size=size,
                                    uncommon=uncommonWords)
    todos: List[Task] = meetingMeta.generate_todo()
    unwrap = lambda x: (x.description, x.deadline.strftime('%Y-%m-%d %H:%M:%S') if x.deadline else None)
    todos: List[Tuple[str, str | None]] = list(map(unwrap, todos))
    if meeting.type == 'team':
        addBulkTodosTeam(id, team, todos, org)
    else:
        addBulkTodos(id, todos, org)
    todos: List[Task] = meetingMeta.generate_todo()
    unwrap = lambda x: (x.description, x.deadline.strftime('%Y-%m-%d %H:%M:%S') if x.deadline else None)
    todos: List[Tuple[str, str | None]] = list(map(unwrap, todos))
    addBulkTodos(id, todos, org)


def updateMeetingTranscription(userId:int,organisation: str, meetingId: int, transcription: str) -> TranscriptionDetails:
    org: int = getOrganisationByName(organisation)
    if not org:
        raise HTTPException(status_code=404, detail=f"Organisation {organisation} not found.")

    if not getRoleByID(org, userId):
        AuthenticationError("Only Organisation members can see meetings.")

    meetingMeta = Meeting(transcription)
    try:
        summary = func_timeout(time, meetingMeta.generate_summary)
    except FunctionTimedOut:
        summary = "Summary timed out. Please use a smaller file or try again."
    uncommonWords = meetingMeta.generate_uncommon_words()
    updateMeetingDetails(organisation=org, meetingId=meetingId, transcription=transcription, summary=summary,
                         uncommonwords=",".join(uncommonWords))
    tasks: List[Task] = meetingMeta.generate_todo()
    replaceTodos(org, meetingId, tasks)
    return TranscriptionDetails(type=True, transcription=transcription, uncommonWords=uncommonWords)


def getMeetingSummary(userId:int, organisation: str, meetingid: int) -> str:
    org: int = getOrganisationByName(organisation)
    if not org:
        raise HTTPException(status_code=404, detail=f"Organisation {organisation} not found.")
    if not getRoleByID(org, userId):
        AuthenticationError("Only Organisation members can see meetings.")
    return getSummary(org, meetingid)[0]


def getMeetingTranscription(userId:int,organisation: str, meetingid: int) -> TranscriptionDetails:
    org: int = getOrganisationByName(organisation)
    if not org:
        raise HTTPException(status_code=404, detail=f"Organisation {organisation} not found.")
    if not getRoleByID(org, userId):
        AuthenticationError("Only Organisation members can see meetings.")
    details = getTranscription(org, meetingid)
    if details is None:
        raise HTTPException(status_code=404, detail=f"Meeting {meetingid} not found.")
    return TranscriptionDetails(type=details[0], transcription=details[1], uncommonWords=details[2].split(','))


def getMeetingInfo(userId:int, organisation: str, meetingid: int) -> MeetingDetails:
    org = getOrganisationByName(organisation)
    if not org:
        raise HTTPException(status_code=404, detail=f"Organisation {organisation} not found.")
    if not getRoleByID(org, userId):
        AuthenticationError("Only Organisation members can see meetings.")
    details = getMeetingMetaData(org, meetingid)
    if not details:
        raise HTTPException(status_code=404, detail=f"Meeting {meetingid} not found.")
    if details[3]:
        team = getTeamById(org, details[3])
        if team:
            return MeetingDetails(id=meetingid, title=details[0], date=details[1], type='team',
                                  transcriptionGenerated=details[2], team=team[0])
        else:
            return MeetingDetails(id=meetingid, title=details[0], date=details[1], type='organisation',
                                  transcriptionGenerated=details[2])
    else:
        return MeetingDetails(id=meetingid, title=details[0], date=details[1], type='organisation',
                              transcriptionGenerated=details[2])
