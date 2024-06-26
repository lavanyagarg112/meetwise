import React, { useState } from 'react';
import classes from './SignUp.module.css';

const SignUp = () => {
  const [isOrganisation, setIsOrganisation] = useState(false);

  const setOrganisation = () => {
    setIsOrganisation(true);
  };

  const setUser = () => {
    setIsOrganisation(false);
  };

  return (
    <div className={classes.signupContainer}>
      <div className={classes.tabs}>
        <div
          className={`${classes.tab} ${!isOrganisation ? classes.active : ''}`}
          onClick={setUser}
        >
          User
        </div>
        <div
          className={`${classes.tab} ${isOrganisation ? classes.active : ''}`}
          onClick={setOrganisation}
        >
          Organisation
        </div>
      </div>
      <div className={classes.content}>
        {isOrganisation ? (
          <div>Is organisation</div>
        ) : (
          <div>Is not organisation</div>
        )}
      </div>
    </div>
  );
};

export default SignUp;
