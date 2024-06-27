import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

const OrganisationPage = () => {

  const {id} = useParams()
  const [organisationName, setOrganisationName] = useState('Organisation Name')

  // get organisation name based on id, useeffect to get it on load

  // this page should only be accessed if the user has permissions

  return (
    <div>
      <h1>{organisationName}</h1>
      <div>
        <div>
          <h3>Organisation Owner</h3>
        </div>
        <div>
          <h3>Organisation Admins</h3>
        </div>
        <div>
          <h3>Organisation Users</h3>
        </div>
        <div>
          <h3>Teams</h3>
        </div>
      </div>
      {/* under each of the above, we have a manage permissions on the side, as well as view profile */}
      {/* if the current user is one of them then it says my profile */}
      <div>
        <h3>Invite Users</h3>
      </div>
    </div>
  )
}

export default OrganisationPage
