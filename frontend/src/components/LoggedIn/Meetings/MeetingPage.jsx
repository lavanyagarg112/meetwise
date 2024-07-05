import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

import Transcription from './MeetingPage/Transcription'
import Summary from './MeetingPage/Summary'
import MeetingTodos from './MeetingPage/MeetingTodos'

const MeetingPage = () => {

  const {id} = useParams()
  const { organisation } = useParams()

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [type, setType] = useState('')
  const [team, setTeam] = useState(null)


  const getMeetingDetails = async () => {

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_ULS}/get-meeting-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: id,
          organisation: organisation,
        }),
        credentials: 'include'
      })

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorText = 'An error occurred adding the user.';
        throw new Error(errorText);
      }

      const data = await response.json();
      setTitle(data.id)
      setDate(data.date)
      setType(data.type)
      setTeam(data.team)

    } catch (error) {
      console.log('Error: ', error)
    }

  }

  return (
    <div>
      <div>
        <div>{title}</div>
        <div>{date}</div>
      </div>
      <div>
        <Transcription />
      </div>
      <div>
        <Summary />
      </div>
      <div>
        <MeetingTodos />
      </div>
    </div>
  )
}

export default MeetingPage
