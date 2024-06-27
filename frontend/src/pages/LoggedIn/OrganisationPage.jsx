import React from 'react'
import { useParams } from 'react-router-dom'

const OrganisationPage = () => {

  const {id} = useParams()

  return (
    <div>
      {id}
    </div>
  )
}

export default OrganisationPage
