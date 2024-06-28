import React, { useEffect, useState } from 'react'

import classes from './OrganisationComponent.module.css'

import OrganisationBlock from './Organisations/OrganisationBlock'
import CreateOrganisationForm from './Organisations/CreateOrganisationForm'

const DUMMY_DATA = [
  {
    id: 0,
    name: 'organisation1'
  },
  {
    id: 1,
    name: 'organisation2'
  },

  
]

let id = 0

const OrganisationComponent = ({user}) => {

  const [organisations, setOrganisations] =useState([])
  const [isFormVisible, setIsFormVisible] = useState(false)

  const newOrganisation = async (organisationName) => {

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/new-organisation`, {
        method:'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: organisationName
        }),
        credentials: 'include'
      })
  
      if (!response.ok) {
        const errorResponse = await response.json()
        const errorText = 'An error occurred creating your organisations.'
        throw new Error(errorText)
      }
  
      const data = await response.json()
      setOrganisations([...organisations, data])
  
    } catch (error) {
      console.log('ERROR')
    }

    // to be removed after end point works

    const data = {
      id: id,
      name: organisationName
    }
    id += 1
    setOrganisations([...organisations, data])
  }

  const createOrg = () => {
    setIsFormVisible(true)
  }

  const JoinOrg = () => {
    alert('Join organisation')
  }

  const getOrganisations = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-organisations`, {
        credentials: 'include'
      })
  
      if (!response.ok) {
        const errorResponse = await response.json()
        const errorText = 'An error occurred fetching your organisations.'
        throw new Error(errorText)
      }
  
      const data = await response.json()
      setOrganisations(data.organisations)
  
    } catch (error) {
      console.log('ERROR')
    }
    // to be removed after end point works
    setOrganisations(DUMMY_DATA)
  }

  useEffect(() => {
    getOrganisations()
  }, [])

  return (
    <div className={classes.organisationComponent}>
      <div className={classes.headerContainer}>
        <div className={classes.organisationsHeader}>My Organisations</div>
        <div className={classes.buttonContainer}>
          <button className={classes.createButton} onClick={createOrg}>Create New Organisation</button>
          <button className={classes.createButton} onClick={JoinOrg}>Join Organisation</button>
        </div>
      </div>
      <div className={classes.organisationContainer}>
        {organisations.length > 0 && organisations.map((org) => 
          <OrganisationBlock key={org.id} org={org} />
        )}
        {organisations.length === 0 && <p className={classes.noOrganisations}>No organisations created / No organisations joined</p>}
        {isFormVisible && <CreateOrganisationForm onClose={() => setIsFormVisible(false)} onCreate={newOrganisation} />}
      </div>
    </div>
  )
}

export default OrganisationComponent
