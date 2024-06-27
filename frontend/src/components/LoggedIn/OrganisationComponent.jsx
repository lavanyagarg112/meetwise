import React, { useEffect, useState } from 'react'

import classes from './OrganisationComponent.module.css'

import OrganisationBlock from './Organisations/OrganisationBlock'

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

let id = 2

const OrganisationComponent = ({user}) => {

  const [organisations, setOrganisations] =useState([])

  const newOrganisation = (organisationName) => {

    // post reqest for organisation name
    // get back id and organsation name

    const data = {
      id: id,
      name: organisationName
    }
    id += 1
    setOrganisations([...organisations, data])
  }

  const createOrg = () => {
    alert('create new organisations')
    newOrganisation('neworganisation')
  }

  const getOrganisations = () => {
    // get request for get user organisations
    setOrganisations(DUMMY_DATA)
  }

  useEffect(() => {
    getOrganisations()
  }, [])

  return (
    <div className={classes.organisationComponent}>
      <div className={classes.headerContainer}>
        <div className={classes.organisationsHeader}>My Organisations</div>
        <button className={classes.createButton} onClick={createOrg}>Create New Organisation</button>
      </div>
      <div className={classes.organisationContainer}>
        {organisations.length > 0 && organisations.map((org) => 
          <OrganisationBlock key={org.id} org={org} />
        )}
        {organisations.length === 0 && <p className={classes.noOrganisations}>No organisations created</p>}
      </div>
    </div>
  )
}

export default OrganisationComponent
