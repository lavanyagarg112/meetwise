import React from 'react'
import classes from './OrganisationBlock.module.css';

import { useNavigate } from 'react-router-dom';

const TeamBlock = ({team}) => {

    const navigate = useNavigate()

    const handleClick = () => {
        navigate(`/team/${team.name}`)
    }

  return (
    <div onClick={handleClick} className={classes.organisationBlock}>
      <div className={classes.orgName}>{team.name}</div>
    </div>
  )
}

export default TeamBlock
