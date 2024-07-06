from typing import List, Tuple

from fastapi import HTTPException
from mutagen.mp3 import MP3
from IOSchema import MeetingInput, TranscriptionDetails, MeetingDetails
from OrganisationHelpers import getOrganisationByName, getTeamByName
from audio_transcription import transcribe
from Meeting import Meeting, Task
from Todos import replaceTodos
from database import storeMeetingDetailsTeam, storeMeetingDetailsOrg, getSummary, updateMeetingDetails, \
    getTranscription, getMeetingMetaData, addBulkTodos


def storeMeeting(meeting: MeetingInput):
    file = meeting.file
    if file.content_type != 'audio/mpeg':
        raise HTTPException(status_code=415,
                            detail=f'''Unsupported media type. Only Audio files are supported.Received {file.content_type} "
                                   instead''')

    org = getOrganisationByName(meeting.organisation)
    size = file.size
    file = file.file
    length = int(MP3(file).info.length)
    try:
        transcription = transcribe(file)
    except:
        raise HTTPException(status_code=500, detail="Transcription failed.")

    meetingMeta = Meeting(transcription)
    summary = meetingMeta.generate_summary()
    uncommonWords = ",".join(meetingMeta.generate_uncommon_words())

    if meeting.type == 'team':
        team = getTeamByName(org, meeting.team)
        id = storeMeetingDetailsTeam(org=org, name=meeting.meetingName, team=team, transcription=transcription,
                                     length=length, date=meeting.meetingDate.strftime('%Y-%m-%d %H:%M:%S'),
                                     summary=summary,
                                     size=size, uncommon=uncommonWords)
    else:
        id = storeMeetingDetailsOrg(org=org, name=meeting.meetingName, transcription=transcription, length=length,
                                    date=meeting.meetingDate.strftime('%Y-%m-%d %H:%M:%S'), summary=summary, size=size,
                                    uncommon=uncommonWords)
    todos: List[Task] = meetingMeta.generate_todo()
    unwrap = lambda x: (x.description, x.deadline.strftime('%Y-%m-%d %H:%M:%S'))
    todos: List[Tuple[str, str]] = list(map(unwrap, todos))
    addBulkTodos(id, todos, org)


def updateMeetingTranscription(organisation: str, meetingId: int, transcription: str) -> TranscriptionDetails:
    org: int = getOrganisationByName(organisation)
    if not org:
        raise HTTPException(status_code=404, detail=f"Organisation {organisation} not found.")

    meetingMeta = Meeting(transcription)
    summary = meetingMeta.generate_summary()
    uncommonWords = meetingMeta.generate_uncommon_words()
    updateMeetingDetails(organisation=org, meetingId=meetingId, transcription=transcription, summary=summary,
                         uncommonwords=",".join(uncommonWords))
    tasks: List[Task] = meetingMeta.generate_todo()
    replaceTodos(org, meetingId, tasks)
    return TranscriptionDetails(type=True, transcription=transcription, uncommonWords=uncommonWords)


def getMeetingSummary(organisation: str, meetingid: int) -> str:
    org: int = getOrganisationByName(organisation)
    if not org:
        raise HTTPException(status_code=404, detail=f"Organisation {organisation} not found.")
    return getSummary(org, meetingid)[0]


def getMeetingTranscription(organisation: str, meetingid: int) -> TranscriptionDetails:
    org: int = getOrganisationByName(organisation)
    if not org:
        raise HTTPException(status_code=404, detail=f"Organisation {organisation} not found.")
    details = getTranscription(org, meetingid)
    if details is None:
        raise HTTPException(status_code=404, detail=f"Meeting {meetingid} not found.")
    return TranscriptionDetails(type=details[0], transcription=details[1], uncommonWords=details[2].split(','))


def getMeetingInfo(organisation: str, meetingid: int) -> MeetingDetails:
    org = getOrganisationByName(organisation)
    if not org:
        raise HTTPException(status_code=404, detail=f"Organisation {organisation} not found.")
    details = getMeetingMetaData(org, meetingid)
    if not details:
        raise HTTPException(status_code=404, detail=f"Meeting {meetingid} not found.")
    if details[3]:
        return MeetingDetails(id=meetingid, title=details[0], date=details[1], type='team',
                              transcriptionGenerated=details[2], team=details[3])
    else:
        return MeetingDetails(id=meetingid, title=details[0], date=details[1], type='organisation',
                              transcriptionGenerated=details[2])
