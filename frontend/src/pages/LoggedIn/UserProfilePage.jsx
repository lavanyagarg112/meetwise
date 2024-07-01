import React from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../store/auth-context'

const UserProfilePage = () => {

    const {username} = useParams()
    const {user} = useAuth()

  return (
    <div>
      {!user ? <div>Login to view user profile page</div> : (
        <div>
            User Profile Page - {username}
        </div>
      )}
      
    </div>
  )
}

export default UserProfilePage
