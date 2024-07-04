from fastapi import HTTPException
from mutagen.mp3 import MP3
from IOSchema import MeetingInput
from OrganisationHelpers import getOrganisationByName, getTeamByName
from audio_transcription import transcribe
from Meeting import Meeting
from database import storeMeetingDetailsTeam, storeMeetingDetailsOrg


def storeMeeting(meeting: MeetingInput):
    file = meeting.file
    if file.content_type != 'audio/mpeg':
        raise HTTPException(status_code=415,
                            detail=f"Unsupported media type. Only Audio files are supported.Received {file.content_type} instead")

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

    if meeting.type == 'team':
        team = getTeamByName(org, meeting.team)
        storeMeetingDetailsTeam(org=org, name=meeting.meetingName, team=team, transcription=transcription,
                                length=length, date=meeting.meetingDate.strftime('%Y-%m-%d %H:%M:%S'), summary=summary,
                                size=size)
    else:
        storeMeetingDetailsOrg(org=org, name=meeting.meetingName, transcription=transcription, length=length,
                               date=meeting.meetingDate.strftime('%Y-%m-%d %H:%M:%S'), summary=summary, size=size)