import React, { useEffect, useState } from 'react'

import Loading from '../../../ui/Loading'

const Transcription = ({type, team, organisation, meetingid}) => {

  const [canEdit, setCanEdit] = useState(false)
  const [id, setTranscriptionId] = useState(null)
  const [transcriptionTpye, setTranscriptionType] = useState('')
  const [transcription, setTranscription] = useState('')
  const [uncommonWords, setUncommonWords] = useState([])
  const [isEditing, setIsEditing] = useState(false)

  const [loading, setLoading] = useState(false)

  useEffect(() => {

    if (type === 'organisation') {
      getUserOrgRole(organisation)
    } else {
      getUserTeamRole(team, organisation)
    }

  }, [])

  const getUserOrgRole = async (organisationName) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-user-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: organisationName,
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorText = 'An error occurred fetching the teams.';
        throw new Error(errorText);
      }

      const data = await response.json();
      if (data.role !== 'user') {
        setCanEdit(true)
      } else {
        setCanEdit(false)
      }


    } catch (error) {
      console.log('error: ', error)
    }
  }

  const getUserTeamRole = async (teamName, organisationName) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-team-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: teamName,
          organisationName: organisationName
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorText = 'An error occurred fetching the teams.';
        throw new Error(errorText);
      }

      const data = await response.json();
      if (data.role !== 'user') {
        setCanEdit(true)
      } else {
        setCanEdit(false)
      }


    } catch (error) {
      console.log('error: ', error)
    }
  }


  const getMeetingTranscription = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-transcription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingid: meetingid,
          organisation: organisation
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorText = 'An error occurred fetching the teams.';
        throw new Error(errorText);
      }

      const data = await response.json();
      setTranscriptionId(data.id)
      setTranscriptionType(data.type)
      setTranscription(data.transcription)
      setUncommonWords(data.uncommonWords)

    } catch (error) {
      console.log('error: ', error)
    }
  }

  const handleEditTranscription = () => {
    alert('Edit transcription')
    setIsEditing(true)
  }

  const handleSubmitTranscription = async () => {
    setIsEditing(false)
    setLoading(true)
    try {
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/update-transcription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingid: meetingid,
          organisation: organisation,
          transcriptionid: id
        }),
        credentials: 'include',

      })

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorText = 'An error occurred fetching the teams.';
        throw new Error(errorText);
      }

      const data = await response.json();
      setTranscriptionType(data.type)
      setTranscription(data.transcription)
      setUncommonWords(data.uncommonWords)

    } catch (error) {

    }
    setLoading(false)
  }

  return (
    <div>
      {loading && <Loading />}
      <div>Meeting Transcription</div>
      {canEdit && <div onClick={handleEditTranscription}>Edit Transcription</div>}
      {!isEditing && <div>
        {transcription}
      </div>}
      {isEditing && (
        <div>
          <div>
            <div>{/* the edit box for todo, the uncommon words must be highlighted */} </div>
            {uncommonWords && uncommonWords.length > 0 && uncommonWords.map((word) => {
              <div>Word</div>
            })}
          </div>
          {transcriptionTpye === 'user' && <div>Warning: Summary and todos will be regenerated. You will lose manual todos</div>}
          {transcriptionTpye === 'ai' && <div>Warning: Once you submit, your summary and todos will be regenerated after which you can edit your todos. However, if you make any further edits to the transcription, your work will be lost</div>}
          <div onClick={() => setIsEditing(false)}>Cancel Edit</div>
          <div onClick={handleSubmitTranscription}>Submit Edit</div>
        </div>
      )}
    </div>
  )
}

export default Transcription
