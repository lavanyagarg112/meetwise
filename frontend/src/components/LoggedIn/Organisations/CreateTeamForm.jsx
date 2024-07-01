import React, { useState } from 'react';
import classes from './CreateOrganisationForm.module.css';

const CreateTeamForm = ({ onClose, onCreate }) => {
  const [teamName, setTeamName] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onCreate(teamName);
    onClose();
  };

  return (
    <div className={classes.modal}>
      <div className={classes.modalContent}>
        <span className={classes.closeButton} onClick={onClose}>&times;</span>
        <h2>Create New Team</h2>
        <form onSubmit={handleSubmit}>
          <div className={classes.formControl}>
            <label>Team Name</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
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

export default CreateTeamForm;
