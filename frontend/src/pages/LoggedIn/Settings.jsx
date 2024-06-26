import React from 'react'
import { useAuth } from '../../store/auth-context'

const Settings = () => {

    const {user} = useAuth()

  return (
    <div>
      {user && <div>Settings</div>}
      {!user && <div>Log in</div>}
    </div>
  )
}

export default Settings
