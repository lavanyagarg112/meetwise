import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Switch, FormControlLabel } from '@mui/material';

import PeopleList from '../../components/LoggedIn/Organisations/PeopleList';
import TeamBlock from '../../components/LoggedIn/Organisations/TeamBlock';

import CreateTeamForm from '../../components/LoggedIn/Organisations/CreateTeamForm';
import OrganisationMeetingsList from '../../components/LoggedIn/Meetings/OrganisationMeetingsList';
import UploadMeeting from '../../components/LoggedIn/Meetings/UploadMeeting';

import NotFoundPage from '../NotFoundPage';
import Loading from '../../components/ui/Loading';

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
  const [pendingInvites, setPendingInvites] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');

  const [isOwnersCollapsed, setIsOwnersCollapsed] = useState(true);
  const [isAdminsCollapsed, setIsAdminsCollapsed] = useState(true);
  const [isUsersCollapsed, setIsUsersCollapsed] = useState(true);
  const [isMeetingsCollapsed, setIsMeetingsCollapsed] = useState(true);
  const [isInvitesCollapsed, setIsInvitesCollapsed] = useState(true);

  const [showerror, setShowError] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [showInvitePopup, setShowInvitePopup] = useState(false);

  const [loading, setLoading] = useState(false)

  const toggleOwners = () => setIsOwnersCollapsed(!isOwnersCollapsed);
  const toggleAdmins = () => setIsAdminsCollapsed(!isAdminsCollapsed);
  const toggleUsers = () => setIsUsersCollapsed(!isUsersCollapsed);
  const toggleMeetings = () => setIsMeetingsCollapsed(!isMeetingsCollapsed);
  const toggleInvites = () => setIsInvitesCollapsed(!isInvitesCollapsed);

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
  };

  const createTeam = () => {
    setIsFormVisible(true);
  };

  // decide at what times to reget the info

  const getOrganisationInfo = async (name) => {
    try {
      setLoading(true)
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
      setPendingInvites(data.organisation.pendingInvites);
      setUserRole(data.userRole);
    } catch (error) {
      console.log('ERROR');
      setShowError(true);
    }
    setLoading(false)
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

  const handleInviteUser = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/invite-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          organisation: organisationName,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorText = 'An error occurred inviting the user.';
        throw new Error(errorText);
      }

      const data = await response.json();
      // should probably add validation for type of data sent
      setPendingInvites([...pendingInvites, data]);
      setShowInvitePopup(true);
      setTimeout(() => setShowInvitePopup(false), 3000);
    } catch (error) {
      console.log('ERROR', error);
    }
  };

  useEffect(() => {
    getOrganisationInfo(name);
  }, [name]);

  if (showerror) {
    return <NotFoundPage />;
  }

  return (
    <div className={classes.organisationPage}>
      {loading ? <Loading /> : (
        <div>
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
            {/* {role != 'user' && <div className={classes.blankSection}>
              <UploadMeeting organisationName={organisationName} allTeams={teams} />
            </div>} */}
            <div className={classes.section}>
              <div className={classes.sectionTitle} onClick={toggleMeetings}>
                <h3>View Organisation meetings</h3>
                <span className={classes.toggleIcon}>
                  {isMeetingsCollapsed ? 'View Meetings' : 'Close Section'}
                </span>
              </div>
              {!isMeetingsCollapsed && (
                <div>
                  {role != 'user' && <div className={classes.blankSection}>
                    <UploadMeeting organisationName={organisationName} allTeams={teams} />
                  </div>}
                  <OrganisationMeetingsList organisationName={organisationName} goToMeeting={goToMeeting} />
                </div>
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
                <div className={classes.sectionTitle} onClick={toggleInvites}>
                  <h3>Invite Users</h3>
                  <span className={classes.toggleIcon}>
                    {isInvitesCollapsed ? 'View Invites' : 'Close Section'}
                  </span>
                </div>
                {!isInvitesCollapsed && (
                  <div>
                    <form onSubmit={handleInviteUser} className={classes.inviteUserForm}>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="User Email"
                        required
                      />
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        required
                      >
                        <option value="">Select Role</option>
                        <option value="admin">Organisation Admin</option>
                        <option value="user">Organisation User</option>
                      </select>
                      <button type="submit">Invite User</button>
                    </form>
                    <div className={classes.pendingInvites}>
                      <h4>Pending Invites</h4>
                      {!pendingInvites || pendingInvites.length === 0 ? (
                        <p>No pending invites.</p>
                      ) : (
                        pendingInvites.map((invite) => (
                          <div key={invite.id} className={classes.inviteItem}>
                            <span>{invite.email} - {invite.role}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {showInvitePopup && (
              <div className={classes.popup}>
                User invited successfully!
              </div>
            )}
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export default OrganisationPage;
