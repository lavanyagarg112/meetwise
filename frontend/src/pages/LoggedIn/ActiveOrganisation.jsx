import React, { useEffect } from 'react'
import { useAuth } from '../../store/auth-context'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

const ActiveOrganisation = () => {
  const { activeOrganisation, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && activeOrganisation) {
      console.log('activeOrganisation: ', activeOrganisation)
      navigate(`/organisations/${activeOrganisation}`)
    } else if (user) {
      navigate(`/organisations`)
    }
  }, [user, activeOrganisation, navigate])

  if (!user) {
    return <div>Please <Link to={`/sign-up`}>Log in</Link> to view this page</div>
  }

  return null
}

export default ActiveOrganisation
