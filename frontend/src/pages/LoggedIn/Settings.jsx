import React from 'react'
import { useAuth } from '../../store/auth-context'
import { Link } from 'react-router-dom'

import SettingsComponent from '../../components/LoggedIn/SettingsComponent'

const Settings = () => {

    const {user} = useAuth()

  return (
    <div>
      {!user && <div>Please <Link to={`/sign-up`}>Log in</Link> to view this page</div>}
      {user && <SettingsComponent user={user} />}
    </div>
  )
}

export default Settings
