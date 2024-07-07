import React from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../store/auth-context'
import { Link } from 'react-router-dom'

const UserProfilePage = () => {

    const {username} = useParams()
    const {user} = useAuth()

  return (
    <div>
      {!user ? <div>Please <Link to={`/sign-up`}>Log in</Link> to view this page</div> : (
        <div>
            User Profile Page - Coming soon!
        </div>
      )}
      
    </div>
  )
}

export default UserProfilePage
