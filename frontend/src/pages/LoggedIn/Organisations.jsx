import React from 'react'
import { useAuth } from '../../store/auth-context'

import OrganisationComponent from '../../components/LoggedIn/OrganisationComponent'

const Organisations = () => {

    const {user} = useAuth()

  return (
    <div>
      {!user && <div>Log in</div>}

      {user && (
        <OrganisationComponent />
    )}
      
    </div>
  )
}

export default Organisations
