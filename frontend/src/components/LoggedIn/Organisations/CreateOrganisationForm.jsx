import React, { useState } from 'react';
import classes from './CreateOrganisationForm.module.css';

const CreateOrganisationForm = ({ onClose, onCreate }) => {
  const [organisationName, setOrganisationName] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onCreate(organisationName);
    onClose();
  };

  return (
    <div className={classes.modal}>
      <div className={classes.modalContent}>
        <span className={classes.closeButton} onClick={onClose}>&times;</span>
        <h2>Create New Organisation</h2>
        <form onSubmit={handleSubmit}>
          <div className={classes.formControl}>
            <label>Organisation Name</label>
            <input
              type="text"
              value={organisationName}
              onChange={(e) => setOrganisationName(e.target.value)}
              required
            />
          </div>
          <div className={classes.formActions}>
            <button type="submit">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrganisationForm;
