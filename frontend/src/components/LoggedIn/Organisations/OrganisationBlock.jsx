import React from 'react';
import classes from './OrganisationBlock.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../store/auth-context';

const OrganisationBlock = ({ org }) => {

    const {activeOrganisation} = useAuth();

    const navigate = useNavigate()

    const handleClick = () => {
        navigate(`/organisations/${org.name}`)
    }

  return (
    <div onClick={handleClick} className={`${classes.organisationBlock} ${activeOrganisation === org.name ? classes.activeOrg : ''}`}>
      <div className={classes.orgName}>{org.name}</div>
    </div>
  );
};

export default OrganisationBlock;
