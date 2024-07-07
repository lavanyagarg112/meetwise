import React from 'react'
import { useAuth } from '../../store/auth-context'
import { Link } from 'react-router-dom'

import OrganisationComponent from '../../components/LoggedIn/OrganisationComponent'

const Organisations = () => {

    const {user} = useAuth()

  return (
    <div>
      {!user && <div>Please <Link to={`/sign-up`}>Log in</Link> to view this page</div>}

      {user && (
        <OrganisationComponent user={user} />
    )}
      
    </div>
  )
}

export default Organisations
