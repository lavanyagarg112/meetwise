import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Switch, FormControlLabel } from '@mui/material';

import PeopleList from '../../components/LoggedIn/Organisations/PeopleList';
import TeamBlock from '../../components/LoggedIn/Organisations/TeamBlock';

import CreateTeamForm from '../../components/LoggedIn/Organisations/CreateTeamForm';
import OrganisationMeetingsList from '../../components/LoggedIn/Meetings/OrganisationMeetingsList';

import NotFoundPage from '../NotFoundPage';

import classes from './OrganisationPage.module.css';
import { useAuth } from '../../store/auth-context';

const OrganisationPage = () => {
  const { user, activeOrganisation, setActiveOrganisation } = useAuth();
  const { name } = useParams();
  const [organisationName, setOrganisationName] = useState('');
  const [owners, setOwners] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [role, setUserRole] = useState('user');
  const [permitted, setIsPermitted] = useState(false);

  const [isOwnersCollapsed, setIsOwnersCollapsed] = useState(true);
  const [isAdminsCollapsed, setIsAdminsCollapsed] = useState(true);
  const [isUsersCollapsed, setIsUsersCollapsed] = useState(true);
  const [isMeetingsCollapsed, setIsMeetingsCollapsed] = useState(true);

  const [showerror, setShowError] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const toggleOwners = () => setIsOwnersCollapsed(!isOwnersCollapsed);
  const toggleAdmins = () => setIsAdminsCollapsed(!isAdminsCollapsed);
  const toggleUsers = () => setIsUsersCollapsed(!isUsersCollapsed);
  const toggleMeetings = () => setIsMeetingsCollapsed(!isMeetingsCollapsed);

  const navigate = useNavigate();

  const newTeam = async (teamName) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/new-team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: teamName,
          organisation: organisationName,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorText = 'An error occurred creating your organisations.';
        throw new Error(errorText);
      }

      const data = await response.json();
      setTeams([...teams, data]);
    } catch (error) {
      console.log('ERROR');
    }

    // to be removed after endpoint
    const data = {
      id: 3,
      name: teamName,
    };
    setTeams([...teams, data]);
  };

  const createTeam = () => {
    setIsFormVisible(true);
  };

  const getOrganisationInfo = async (name) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/organisationpage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorText = 'An error occurred creating your organisations.';
        setShowError(true);
        throw new Error(errorText);
      }

      const data = await response.json();
      setIsPermitted(data.isPermitted);
      setOrganisationName(data.organisation.name);
      setOwners(data.organisation.owners);
      setAdmins(data.organisation.admins);
      setUsers(data.organisation.users);
      setTeams(data.organisation.teams);
      setUserRole(data.userRole);
    } catch (error) {
      console.log('ERROR');
      setShowError(true);
    }
  };

  const handleToggleActive = async () => {
    const newActiveOrganisation = activeOrganisation === organisationName ? '' : organisationName;
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/set-active-organisation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newActiveOrganisation,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorText = 'An error occurred setting the active organisation.';
        throw new Error(errorText);
      }

      setActiveOrganisation(newActiveOrganisation);
    } catch (error) {
      console.log('ERROR', error);
    }
  };

  const goToMeeting = (id) => {
    navigate(`/meetings/${id}`);
  };

  useEffect(() => {
    getOrganisationInfo(name);
  }, [name]);

  if (showerror) {
    return <NotFoundPage />;
  }

  return (
    <div className={classes.organisationPage}>
      {!user ? (
        <div>Log in</div>
      ) : !permitted ? (
        <div>Not permitted</div>
      ) : (
        <div>
          <div className={classes.header}>
            <h1>{organisationName}</h1>
            <FormControlLabel
              control={
                <Switch
                  checked={activeOrganisation === organisationName}
                  onChange={handleToggleActive}
                  name="activeOrganisationToggle"
                  color="primary"
                />
              }
              label={activeOrganisation === organisationName ? 'Current Active Organisation' : 'Set as Active'}
            />
          </div>
          <div className={classes.teamssection}>
            <div className={classes.teamsHeader}>
              <h3>My Teams</h3>
              {role !== 'user' && (
                <button className={classes.createTeamButton} onClick={createTeam}>
                  Create New Team
                </button>
              )}
              {isFormVisible && <CreateTeamForm onClose={() => setIsFormVisible(false)} onCreate={newTeam} />}
            </div>
            <div className={classes.organisationContainer}>
              {!teams || teams.length === 0 ? (
                <div className={classes.noOrganisations}>No teams yet</div>
              ) : (
                teams.map((team) => <TeamBlock key={team.id} team={team} organisationname={organisationName} />)
              )}
            </div>
          </div>
          <div className={classes.section}>
            <div className={classes.sectionTitle} onClick={toggleMeetings}>
              <h3>View Organisation meetings</h3>
              <span className={classes.toggleIcon}>
                {isMeetingsCollapsed ? 'View Meetings' : 'Close Section'}
              </span>
            </div>
            {!isMeetingsCollapsed && (
              <OrganisationMeetingsList organisationName={organisationName} goToMeeting={goToMeeting} />
            )}
          </div>
          <div className={classes.section}>
            <div className={classes.sectionTitle} onClick={toggleOwners}>
              <h3>Organisation Owners</h3>
              <span className={classes.toggleIcon}>
                {isOwnersCollapsed ? 'View Owners' : 'Close Section'}
              </span>
            </div>
            {!isOwnersCollapsed && <PeopleList people={owners} currentUser={user} role={role} />}
          </div>
          <div className={classes.section}>
            <div className={classes.sectionTitle} onClick={toggleAdmins}>
              <h3>Organisation Admins</h3>
              <span className={classes.toggleIcon}>
                {isAdminsCollapsed ? 'View Admins' : 'Close Section'}
              </span>
            </div>
            {!isAdminsCollapsed && <PeopleList people={admins} currentUser={user} role={role} />}
          </div>
          <div className={classes.section}>
            <div className={classes.sectionTitle} onClick={toggleUsers}>
              <h3>Organisation Users</h3>
              <span className={classes.toggleIcon}>
                {isUsersCollapsed ? 'View Users' : 'Close Section'}
              </span>
            </div>
            {!isUsersCollapsed && <PeopleList people={users} currentUser={user} role={role} />}
          </div>
          {role !== 'user' && (
            <div className={classes.section}>
              <h3>Invite Users</h3>
              {/* Add your invite user functionality here */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrganisationPage;
