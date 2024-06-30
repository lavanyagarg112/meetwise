import React from 'react'

import UploadMeeting from './Meetings/UploadMeeting'
import MeetingList from './Meetings/MeetingList'
import Todos from './Meetings/Todos'

const MeetingsComponent = () => {
  return (
    <div>
      <div>Meetings</div>
      <div>Search</div>
      <UploadMeeting />
      <MeetingList />
      <Todos />
    </div>
  )
}

export default MeetingsComponent
