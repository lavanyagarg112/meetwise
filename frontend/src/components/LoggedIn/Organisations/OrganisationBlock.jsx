import React from 'react';
import classes from './OrganisationBlock.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../store/auth-context';

const OrganisationBlock = ({ org }) => {

    const {activeOrganisation} = useAuth();

    const navigate = useNavigate()

    const handleClick = () => {
        navigate(`/organisation/${org.name}`)
    }

  return (
    <div onClick={handleClick} className={classes.organisationBlock}>
      <div className={classes.orgName}>{org.name}</div>
      {/* if activeOrganisation == org.name: do some form of highlight */}
    </div>
  );
};

export default OrganisationBlock;
