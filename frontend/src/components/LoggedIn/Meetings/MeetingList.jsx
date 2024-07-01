import React, { useState, useEffect } from 'react';
import styles from './MeetingList.module.css';
import { useNavigate } from 'react-router-dom';

const DUMMY_DATA = [
  {
    id: 0,
    title: 'meeting 1',
    date: '10-06-2024'
  },
  {
    id: 1,
    title: 'meeting 2',
    date: '10-06-2024'
  },
  {
    id: 3,
    title: 'meeting 3',
    date: '10-06-2024'
  }
];

const DUMMY_TEAMS = [
  {
    id: 0,
    name: 'team 1',
  },
  {
    id: 1,
    name: 'team 2',
  },
  {
    id: 2,
    name: 'team 3',
  }
];

const MeetingList = ({ organisationName }) => {
  const [organisationMeetings, setOrganisationMeetings] = useState([]);
  const [teamMeetings, setTeamMeetings] = useState([]);
  const [isOrgMeetingsCollapsed, setIsOrgMeetingsCollapsed] = useState(true);
  const [isTeamMeetingsCollapsed, setIsTeamMeetingsCollapsed] = useState(true);
  const [teamName, setTeamName] = useState('');
  const [teams, setTeams] = useState([]);

  const navigate = useNavigate();

  const toggleOrgMeetings = () => setIsOrgMeetingsCollapsed(!isOrgMeetingsCollapsed);
  const toggleTeamMeetings = () => setIsTeamMeetingsCollapsed(!isTeamMeetingsCollapsed);

  const getOrganisationMeetings = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-organisation-meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: organisationName
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorText = 'An error occurred fetching your organisations.';
        throw new Error(errorText);
      }

      const data = await response.json();
      setOrganisationMeetings(data.organisations);
    } catch (error) {
      console.log('ERROR');
    }

    // to be removed after endpoint works
    setOrganisationMeetings(DUMMY_DATA)
  };

  const getOrganisationTeams = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-organisation-teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: organisationName
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorText = 'An error occurred fetching your organisations.';
        throw new Error(errorText);
      }

      const data = await response.json();
      setTeams(data.teams);
    } catch (error) {
      console.log('ERROR');
    }

    // to be removed after end point works
    setTeams(DUMMY_TEAMS)
  };

  const getTeamMeetings = async (team) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-team-meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: team,
          organisation: organisationName
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorText = 'An error occurred fetching your organisations.';
        throw new Error(errorText);
      }

      const data = await response.json();
      setTeamMeetings(data.meetings); // Assuming the response structure is data.meetings
    } catch (error) {
      console.log('ERROR');
    }

    // to be removed after endpoint works
    setTeamMeetings(DUMMY_DATA)
  };

  const goToMeeting = (id) => {
    navigate(`/meetings/${id}`);
  };

  const handleTeamChange = (event) => {
    const selectedTeam = event.target.value;
    setTeamName(selectedTeam);
    if (selectedTeam) {
      getTeamMeetings(selectedTeam);
    }
    setTeamMeetings([])
  };

  useEffect(() => {
    getOrganisationMeetings();
    getOrganisationTeams();
  }, [organisationName]);

  return (
    <div className={styles.meetingList}>
      <div onClick={toggleOrgMeetings} className={styles.sectionTitle}>
        <span>Get Full Organisation Meetings</span>
        <span>{isOrgMeetingsCollapsed ? '▼' : '▲'}</span>
      </div>
      {!isOrgMeetingsCollapsed && (
        <div>
          {organisationMeetings.length === 0 ? (
            <p>No meetings available for the organisation.</p>
          ) : (
            organisationMeetings.map((meeting) => (
              <div key={meeting.id} className={styles.meetingItem}>
                <span>{meeting.title}</span>
                <div>
                  <span className={styles.meetingDate}>{meeting.date}</span>
                  <span className={styles.viewDetails} onClick={() => goToMeeting(meeting.id)}>View Details</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      <div onClick={toggleTeamMeetings} className={styles.sectionTitle}>
        <span>See Team Specific Meetings</span>
        <span>{isTeamMeetingsCollapsed ? '▼' : '▲'}</span>
      </div>
      {!isTeamMeetingsCollapsed && (
        <div>
          {teams.length > 0 && (
            <select className={styles.selectMenu} onChange={handleTeamChange} value={teamName}>
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.name}>
                  {team.name}
                </option>
              ))}
            </select>
          )}
          {teamMeetings.length === 0 ? (
            <p>No meetings available for the team.</p>
          ) : (
            teamMeetings.map((meeting) => (
              <div key={meeting.id} className={styles.meetingItem}>
                <span>{meeting.title}</span>
                <div>
                  <span className={styles.meetingDate}>{meeting.date}</span>
                  <span className={styles.viewDetails} onClick={() => goToMeeting(meeting.id)}>View Details</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MeetingList;
