import React, { useState, useEffect } from 'react';
import OrganisationMeetingsList from './OrganisationMeetingsList';
import TeamMeetingsList from './TeamMeetingsList';
import styles from './MeetingList.module.css';
import { useNavigate } from 'react-router-dom';

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
  const [isOrgMeetingsCollapsed, setIsOrgMeetingsCollapsed] = useState(true);
  const [isTeamMeetingsCollapsed, setIsTeamMeetingsCollapsed] = useState(true);
  const [teamName, setTeamName] = useState('');
  const [teams, setTeams] = useState([]);

  const navigate = useNavigate();

  const toggleOrgMeetings = () => setIsOrgMeetingsCollapsed(!isOrgMeetingsCollapsed);
  const toggleTeamMeetings = () => setIsTeamMeetingsCollapsed(!isTeamMeetingsCollapsed);

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
  };

  const goToMeeting = (id) => {
    navigate(`/meetings/${id}`);
  };

  const handleTeamChange = (event) => {
    const selectedTeam = event.target.value;
    setTeamName(selectedTeam);
  };

  useEffect(() => {
    getOrganisationTeams();
  }, [organisationName]);

  return (
    <div className={styles.meetingList}>
      <div onClick={toggleOrgMeetings} className={styles.sectionTitle}>
        <span>Get Full Organisation Meetings</span>
        <span>{isOrgMeetingsCollapsed ? '▼' : '▲'}</span>
      </div>
      {!isOrgMeetingsCollapsed && (
        <OrganisationMeetingsList organisationName={organisationName} goToMeeting={goToMeeting} />
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
          <TeamMeetingsList teamName={teamName} organisationName={organisationName} goToMeeting={goToMeeting} />
        </div>
      )}
    </div>
  );
};

export default MeetingList;
