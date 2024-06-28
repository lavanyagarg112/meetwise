import React, { useEffect } from 'react'
import { useAuth } from '../../store/auth-context'
import { useNavigate } from 'react-router-dom'

const ActiveOrganisation = () => {

  const { user } = useAuth()

  if (!user) {
    return <div>Log in</div>
  }

  return <div>No active organisation found. Go to settings to set active organisation / create new organisation</div>
}

export default ActiveOrganisation
