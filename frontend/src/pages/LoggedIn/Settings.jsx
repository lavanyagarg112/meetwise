import React from 'react'
import { useAuth } from '../../store/auth-context'

import SettingsComponent from '../../components/LoggedIn/SettingsComponent'

const Settings = () => {

    const {user} = useAuth()

  return (
    <div>
      {!user && <div>Log in</div>}
      {user && <SettingsComponent user={user} />}
    </div>
  )
}

export default Settings
