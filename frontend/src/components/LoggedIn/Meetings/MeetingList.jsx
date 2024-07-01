import React, { useState } from 'react'
import styles from './MeetingList.module.css'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

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

const MeetingList = ({organisationName}) => {
  const [organisationMeetings, setOrganisationMeetings] = useState(DUMMY_DATA)
  const [teamMeetings, setTeamMeetings] = useState([])
  const [isOrgMeetingsCollapsed, setIsOrgMeetingsCollapsed] = useState(true)
  const [isTeamMeetingsCollapsed, setIsTeamMeetingsCollapsed] = useState(true)

  const [teamName, setTeamName] = useState('')

  const toggleOrgMeetings = () => setIsOrgMeetingsCollapsed(!isOrgMeetingsCollapsed)
  const toggleTeamMeetings = () => setIsTeamMeetingsCollapsed(!isTeamMeetingsCollapsed)

  const navigate = useNavigate()

  const getOrganisationMeetings = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-organisation-meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: organisationName
        }),
        credentials: 'include'
      })
  
      if (!response.ok) {
        const errorResponse = await response.json()
        const errorText = 'An error occurred fetching your organisations.'
        throw new Error(errorText)
      }
  
      const data = await response.json()
      setOrganisationMeetings(data.organisations)
  
    } catch (error) {
      console.log('ERROR')
    }
  }

  const getTeamMeetings = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-team-meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: teamName,
          organisation: organisationName
        }),
        credentials: 'include'
      })
  
      if (!response.ok) {
        const errorResponse = await response.json()
        const errorText = 'An error occurred fetching your organisations.'
        throw new Error(errorText)
      }
  
      const data = await response.json()
      setTeamMeetings(data.teams)
  
    } catch (error) {
      console.log('ERROR')
    }
  }

  const goToMeeting = (id) => {
    navigate(`/meetings/${id}`)
  }

  useEffect(() => {
    getOrganisationMeetings()
  }, [])

  useEffect(() => {
    getTeamMeetings()
  }, [])

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
          {teamMeetings.length === 0 ? (
            <p>Coming soon/ No meetings available for the team.</p>
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
  )
}

export default MeetingList
