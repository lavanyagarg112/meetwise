import React from 'react';
import classes from './OrganisationBlock.module.css';

const OrganisationBlock = ({ org }) => {
  return (
    <div className={classes.organisationBlock}>
      <div className={classes.orgName}>{org.name}</div>
    </div>
  );
};

export default OrganisationBlock;
