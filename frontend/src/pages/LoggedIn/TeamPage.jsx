import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import PeopleList from '../../components/LoggedIn/Organisations/PeopleList';
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
  const [otherUsers, setOtherUsers] = useState([]);
  const [isAdminsCollapsed, setIsAdminsCollapsed] = useState(true);
  const [isUsersCollapsed, setIsUsersCollapsed] = useState(true);
  const [isMeetingsCollapsed, setIsMeetingsCollapsed] = useState(true);
  const [showerror, setShowError] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const navigate = useNavigate();

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
      setOtherUsers(data.team.otherUsers);
    } catch (error) {
      console.log('ERROR');
      setShowError(true);
    }

    // to be removed after endpoint is created
    const otherUsers = [
      {
        id: 0,
        name: 'user10',
        email: 'user10@email.com'
      },
      {
        id: 1,
        name: 'user11',
        email: 'user11@email.com'
      }
    ]
    setIsPermitted(true);
    setShowError(false);
    setTeamName(name);
    setAdmins([]);
    setUsers([]);
    setOtherUsers(otherUsers)
    setUserRole('admin');
  };

  const goToMeeting = (id) => {
    navigate(`/meetings/${id}`);
  };

  const handleAddUser = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/add-team-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName,
          organisation,
          userId: selectedUser.value,
          role: selectedRole,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorText = 'An error occurred adding the user.';
        throw new Error(errorText);
      }

      const data = await response.json();
      if (selectedRole === 'admin') {
        setAdmins([...admins, data.user]);
      } else {
        setUsers([...users, data.user]);
      }
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    } catch (error) {
      console.log('ERROR', error);
    }

    // to be removed after end point is deleted
    const userInfo = {
      id: selectedUser.value,
      username: selectedUser.label
    }
    if (selectedRole === 'admin') {
      setAdmins([...admins, userInfo]);
    } else {
      setUsers([...users, userInfo]);
    }
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  useEffect(() => {
    getTeamInfo(name);
  }, [name]);

  if (showerror) {
    return <NotFoundPage />;
  }

  // should add something for go back to organisation

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
              <h3>Add Users from Organisation</h3>
              <form onSubmit={handleAddUser} className={classes.addUserForm}>
                <Select
                  value={selectedUser}
                  onChange={setSelectedUser}
                  options={otherUsers.map(user => ({ value: user.id, label: `${user.name} (${user.email})` }))}
                  placeholder="Select User"
                  required
                />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="admin">Team Admin</option>
                  <option value="user">Team User</option>
                </select>
                <button type="submit">Add User</button>
              </form>
            </div>
          )}
          {showPopup && (
            <div className={classes.popup}>
              User added successfully!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamPage;
