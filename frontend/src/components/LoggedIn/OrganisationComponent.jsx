import React, { useEffect, useState } from 'react'

import classes from './OrganisationComponent.module.css'

import OrganisationBlock from './Organisations/OrganisationBlock'
import CreateOrganisationForm from './Organisations/CreateOrganisationForm'

import Loading from '../ui/Loading'

const OrganisationComponent = ({user}) => {

  const [organisations, setOrganisations] =useState([])
  const [isFormVisible, setIsFormVisible] = useState(false)

  const [loading, setLoading] = useState(false)

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
  }

  const createOrg = () => {
    setIsFormVisible(true)
  }

  // const JoinOrg = () => {
  //   alert('Join organisation')
  // }

  const getOrganisations = async () => {
    try {
      setLoading(true)
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
    setLoading(false)
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
          {/* <button className={classes.createButton} onClick={JoinOrg}>Join Organisation</button> */}
        </div>
      </div>
      { loading ? <Loading /> : (
        <div className={classes.organisationContainer}>
          {organisations.length > 0 && organisations.map((org) => 
            <OrganisationBlock key={org.id} org={org} />
          )}
          {organisations.length === 0 && <p className={classes.noOrganisations}>No organisations created / No organisations joined</p>}
          {isFormVisible && <CreateOrganisationForm onClose={() => setIsFormVisible(false)} onCreate={newOrganisation} />}
        </div>
      )}
    </div>
  )
}

export default OrganisationComponent
