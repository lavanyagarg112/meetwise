import React, { useState } from 'react'

const MeetingList = () => {

    const [meetings, setMeetings] = useState([])

    const getOrganisationMeetings = () => {

    }

    const getTeamMeetings = () => {

    }

  return (
    <div>
      Meeting List for specific team or specific organisation
      <div>Get Full organisation meetings (collapsable list)</div>
      <div>See team specific meetings (collapsable list)</div>
    </div>
  )
}

export default MeetingList
