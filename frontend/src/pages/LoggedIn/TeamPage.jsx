import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import PeopleList from '../../components/LoggedIn/Organisations/PeopleList';
import TeamBlock from '../../components/LoggedIn/Organisations/TeamBlock';

import TeamMeetingsList from '../../components/LoggedIn/Meetings/TeamMeetingsList';

import NotFoundPage from '../NotFoundPage';

import classes from './OrganisationPage.module.css';
import { useAuth } from '../../store/auth-context';

const TeamPage = ({ organisation }) => {
  const { user } = useAuth();
  const { name } = useParams();
  const [teamName, setTeamName] = useState(name);
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [role, setUserRole] = useState('user');
  const [permitted, setIsPermitted] = useState(false);

  const [isAdminsCollapsed, setIsAdminsCollapsed] = useState(true);
  const [isUsersCollapsed, setIsUsersCollapsed] = useState(true);
  const [isMeetingsCollapsed, setIsMeetingsCollapsed] = useState(true);

  const navigate = useNavigate();

  const [showerror, setShowError] = useState(false);

  const toggleAdmins = () => setIsAdminsCollapsed(!isAdminsCollapsed);
  const toggleUsers = () => setIsUsersCollapsed(!isUsersCollapsed);
  const toggleMeetings = () => setIsMeetingsCollapsed(!isMeetingsCollapsed);

  const getTeamInfo = async (name) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/teampage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, organisation }),
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
      setTeamName(data.team.name);
      setAdmins(data.team.admins);
      setUsers(data.team.users);
      setUserRole(data.userRole);
    } catch (error) {
      console.log('ERROR');
      setShowError(true);
    }

    // to be removed after endpoint is created
    setIsPermitted(true);
    setShowError(false);
    setTeamName(name);
    setAdmins([]);
    setUsers([]);
    setUserRole('admin');
  };

  const goToMeeting = (id) => {
    navigate(`/meetings/${id}`);
  };

  useEffect(() => {
    getTeamInfo(name);
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
            <h1>{teamName}</h1>
          </div>
          <div className={classes.section}>
            <div className={classes.sectionTitle} onClick={toggleMeetings}>
              <h3>View Team meetings</h3>
              <span className={classes.toggleIcon}>
                {isMeetingsCollapsed ? 'View Meetings' : 'Close Section'}
              </span>
            </div>
            {!isMeetingsCollapsed && (
              <TeamMeetingsList teamName={teamName} organisationName={organisation} goToMeeting={goToMeeting} />
            )}
          </div>
          <div className={classes.section}>
            <div className={classes.sectionTitle} onClick={toggleAdmins}>
              <h3>Team Admins</h3>
              <span className={classes.toggleIcon}>
                {isAdminsCollapsed ? 'View Admins' : 'Close Section'}
              </span>
            </div>
            {!isAdminsCollapsed && <PeopleList people={admins} currentUser={user} role={role} />}
          </div>
          <div className={classes.section}>
            <div className={classes.sectionTitle} onClick={toggleUsers}>
              <h3>Team Users</h3>
              <span className={classes.toggleIcon}>
                {isUsersCollapsed ? 'View Users' : 'Close Section'}
              </span>
            </div>
            {!isUsersCollapsed && <PeopleList people={users} currentUser={user} role={role} />}
          </div>
          {role !== 'user' && (
            <div className={classes.section}>
              <h3>Add Users</h3>
              {/* add way to add users from organisation */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamPage;
