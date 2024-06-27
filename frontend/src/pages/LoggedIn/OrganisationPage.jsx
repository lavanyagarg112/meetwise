import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import PeopleList from '../../components/LoggedIn/Organisations/PeopleList'
import TeamBlock from '../../components/LoggedIn/Organisations/TeamBlock'

import classes from './OrganisationPage.module.css'

import { useAuth } from '../../store/auth-context'

const OrganisationPage = () => {
  const { user } = useAuth()
  const { name } = useParams()
  const [organisationName, setOrganisationName] = useState(name)
  const [owners, setOwners] = useState([])
  const [admins, setAdmins] = useState([])
  const [users, setUsers] = useState([])
  const [teams, setTeams] = useState([])
  const [role, setUserRole] = useState('user')
  const [permitted, setIsPermitted] = useState(false)

  const [isOwnersCollapsed, setIsOwnersCollapsed] = useState(false)
  const [isAdminsCollapsed, setIsAdminsCollapsed] = useState(true)
  const [isUsersCollapsed, setIsUsersCollapsed] = useState(true)

  const toggleOwners = () => setIsOwnersCollapsed(!isOwnersCollapsed)
  const toggleAdmins = () => setIsAdminsCollapsed(!isAdminsCollapsed)
  const toggleUsers = () => setIsUsersCollapsed(!isUsersCollapsed)

  const getOrganisationInfo = async (name) => {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/organisationpage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name
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
      setOwners(data.organisation.owners)
      setAdmins(data.organisation.admins)
      setUsers(data.organisation.users)
      setTeams(data.organisation.teams)
      setUserRole(data.userRole)

    } catch (error) {
      console.log('ERROR')
    }

    setIsPermitted(true)
    setOwners([{ id: 0, username: 'user1' }, { id: 1, username: 'user2' }])
    setAdmins([{ id: 2, username: 'admin1' }, { id: 3, username: 'admin2' }])
    setUsers([{ id: 4, username: 'user3' }, { id: 5, username: 'user4' }])
    setTeams([{ id: 0, name: 'team1' }, { id: 1, name: 'team2' }])
    setUserRole('owner')
  }

  useEffect(() => {
    getOrganisationInfo(name)
  }, [name])

  return (
    <div className={classes.organisationPage}>
      {!user ? <div>Log in</div> : !permitted ? <div>Not permitted</div> : (
        <div>
          <div className={classes.header}>
            <h1>{organisationName}</h1>
          </div>
          <div className={classes.section}>
            <div className={classes.sectionTitle} onClick={toggleOwners}>
              <h3>Organisation Owners</h3>
              <span className={classes.toggleIcon}>{isOwnersCollapsed ? 'View Owners' : 'Close Section'}</span>
            </div>
            {!isOwnersCollapsed && <PeopleList people={owners} currentUser={user} role={role} />}
          </div>
          <div className={classes.section}>
            <div className={classes.sectionTitle} onClick={toggleAdmins}>
              <h3>Organisation Admins</h3>
              <span className={classes.toggleIcon}>{isAdminsCollapsed ? 'View Admins' : 'Close Section'}</span>
            </div>
            {!isAdminsCollapsed && <PeopleList people={admins} currentUser={user} role={role} />}
          </div>
          <div className={classes.section}>
            <div className={classes.sectionTitle} onClick={toggleUsers}>
              <h3>Organisation Users</h3>
              <span className={classes.toggleIcon}>{isUsersCollapsed ? 'View Users' : 'Close Section'}</span>
            </div>
            {!isUsersCollapsed && <PeopleList people={users} currentUser={user} role={role} />}
          </div>
          <div className={classes.section}>
            <h3>Teams</h3>
            <div>
              {role !== 'user' && <button className={classes.createTeamButton}>Create New Team</button>}
            </div>
            <div className={classes.organisationContainer}>
              {!teams || teams.length === 0 ? <div className={classes.noOrganisations}>No teams yet</div> : (
                teams.map((team) =>
                  <TeamBlock key={team.id} team={team} />
                )
              )}
            </div>
          </div>
          {role !== 'user' && (
            <div className={classes.section}>
              <h3>Invite Users</h3>
              {/* Add your invite user functionality here */}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default OrganisationPage
