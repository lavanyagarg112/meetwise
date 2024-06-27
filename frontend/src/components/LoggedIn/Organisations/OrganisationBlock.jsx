import React from 'react';
import classes from './OrganisationBlock.module.css';

const OrganisationBlock = ({ org }) => {
  return (
    <div className={classes.organisationBlock}>
      <div className={classes.orgName}>{org.name}</div>
      {/* on click can navigate to organisation page for settings etc? */}
      {/* need to include id params for this */}
    </div>
  );
};

export default OrganisationBlock;
