import React from 'react'
import { useAuth } from '../../store/auth-context'

import MeetingsComponent from '../../components/LoggedIn/MeetingsComponent'

const Meetings = () => {

    const {user, activeOrganisation} = useAuth()

  return (
    <div>
      {!user && <div>Login</div>}
      {user && !activeOrganisation && <div>No active organisation found. Go to settings to set active organisation / create new organisation to view your meetings</div>}
      {user && activeOrganisation && <MeetingsComponent activeOrganisation={activeOrganisation} />}
    </div>
  )
}

export default Meetings
