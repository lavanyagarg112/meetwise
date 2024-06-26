import React from 'react'
import { useAuth } from '../../store/auth-context'

const Meetings = () => {

    const {user} = useAuth()

  return (
    <div>
      {user && <div>Meetings</div>}
      {!user && <div>Log in</div>}
    </div>
  )
}

export default Meetings
