import React from 'react'
import { useParams } from 'react-router-dom'

const MeetingPage = () => {

  const {id} = useParams()

  return (
    <div>
      Specific meeting page: {id}
    </div>
  )
}

export default MeetingPage
