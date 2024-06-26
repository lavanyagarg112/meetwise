import React from 'react'
import { useAuth } from '../../store/auth-context'

const Organisations = () => {

    const {user} = useAuth()

  return (
    <div>
      {user && <div>Organisations</div>}
      {!user && <div>Log in</div>}
    </div>
  )
}

export default Organisations
