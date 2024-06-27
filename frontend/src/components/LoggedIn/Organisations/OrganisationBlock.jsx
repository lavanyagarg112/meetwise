import React from 'react';
import classes from './OrganisationBlock.module.css';
import { useNavigate } from 'react-router-dom';

const OrganisationBlock = ({ org }) => {

    const navigate = useNavigate()

    const handleClick = () => {
        navigate(`/organisation/${org.id}`)
    }

  return (
    <div onClick={handleClick} className={classes.organisationBlock}>
      <div className={classes.orgName}>{org.name}</div>
    </div>
  );
};

export default OrganisationBlock;
