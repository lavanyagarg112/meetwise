import React, { useState } from 'react'
import styles from './MeetingList.module.css'

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
]

const MeetingList = () => {
  const [organisationMeetings, setOrganisationMeetings] = useState(DUMMY_DATA)
  const [teamMeetings, setTeamMeetings] = useState([])
  const [isOrgMeetingsCollapsed, setIsOrgMeetingsCollapsed] = useState(true)
  const [isTeamMeetingsCollapsed, setIsTeamMeetingsCollapsed] = useState(true)

  const toggleOrgMeetings = () => setIsOrgMeetingsCollapsed(!isOrgMeetingsCollapsed)
  const toggleTeamMeetings = () => setIsTeamMeetingsCollapsed(!isTeamMeetingsCollapsed)

  const getOrganisationMeetings = async () => {
    // Fetch organisation meetings from backend
    // Set the state with the fetched meetings
  }

  const getTeamMeetings = async () => {
    // Fetch team meetings from backend
    // Set the state with the fetched meetings
  }

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
                  <span className={styles.viewDetails}>View Details</span>
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
          {teamMeetings.length === 0 ? (
            <p>Coming soon/ No meetings available for the team.</p>
          ) : (
            teamMeetings.map((meeting) => (
              <div key={meeting.id} className={styles.meetingItem}>
                <span>{meeting.title}</span>
                <div>
                  <span className={styles.meetingDate}>{meeting.date}</span>
                  <span className={styles.viewDetails}>View Details</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default MeetingList
