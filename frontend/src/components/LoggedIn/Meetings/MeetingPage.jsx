import React from 'react'
import { useParams } from 'react-router-dom'

const MeetingPage = () => {

  const {id} = useParams()
  const { organisation } = useParams()


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
    } catch (error) {
      console.log('Error: ', error)
    }

  }

  return (
    <div>
      Specific meeting page: {id}
    </div>
  )
}

export default MeetingPage
