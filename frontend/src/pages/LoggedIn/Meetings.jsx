import React from 'react'
import { useAuth } from '../../store/auth-context'

import MeetingsComponent from '../../components/LoggedIn/MeetingsComponent'

const Meetings = () => {

    const {user} = useAuth()

  return (
    <div>
      {!user && <div>Login</div>}
      {user && <MeetingsComponent />}
    </div>
  )
}

export default Meetings
