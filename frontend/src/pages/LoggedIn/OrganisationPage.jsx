import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import PeopleList from '../../components/LoggedIn/Organisations/PeopleList'
import TeamBlock from '../../components/LoggedIn/Organisations/TeamBlock'

import { useAuth } from '../../store/auth-context'

const OrganisationPage = () => {

  const {user} = useAuth()

  const {id} = useParams()
  const [organisationName, setOrganisationName] = useState('Organisation Name')
  const [owners, setOwners] = useState([])
  const [admins, setAdmins] = useState([])
  const [users, setUsers] = useState([])
  const [teams, setTeams] = useState([])

  const [permitted, setIsPermitted] = useState(false)

  const getOrganisationInfo = async (id) => {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/organisationpage`, {
        method:'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id
        }),
        credentials: 'include'
      })
  
      if (!response.ok) {
        const errorResponse = await response.json()
        const errorText = 'An error occurred creating your organisations.'
        throw new Error(errorText)
      }
  
      const data = await response.json()
      setIsPermitted(data.isPermitted)
      setOrganisationName(data.organisation.name)
      setOwners(data.owners)
      setAdmins(data.admins)
      setUsers(data.users)
      setTeams(data.teams)
  
    } catch (error) {
      console.log('ERROR')
    }

    setIsPermitted(true)
  }

  useEffect(() => {
    getOrganisationInfo(id)
  }, [id])

  // get organisation name based on id, useeffect to get it on load

  // this page should only be accessed if the user has permissions

  return (
    <div>
      {!user? <div>Log in</div> : !permitted ? <div>Not permitted</div> : (
        <div>
          <h1>{organisationName}</h1>
          <div>
            <div>
              <h3>Organisation Owner</h3>
              <PeopleList people={owners} currentUser={user} />
            </div>
            <div>
              <h3>Organisation Admins</h3>
              <PeopleList people={admins} currentUser={user} />
            </div>
            <div>
              <h3>Organisation Users</h3>
              <PeopleList people={users} currentUser={user} />
            </div>
            <div>
              <h3>Teams</h3>
              <div>Create New Team</div>
              {teams.length > 0 && teams.map((team) =>
                <TeamBlock team={team} />
              )}
              {teams.length === 0 && <div>No teams yet</div>}
            </div>
          </div>
          {/* under each of the above, we have a manage permissions on the side, as well as view profile */}
          {/* if the current user is one of them then it says my profile */}
          {/* for teams should they only see the ones they are part of? */}
          <div>
            <h3>Invite Users</h3>
          </div>
          <div>
            <h3>Manage Organisation</h3>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrganisationPage
