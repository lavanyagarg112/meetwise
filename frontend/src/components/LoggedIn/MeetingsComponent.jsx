import React from 'react'
import UploadMeeting from './Meetings/UploadMeeting'
import MeetingList from './Meetings/MeetingList'
import Todos from './Meetings/Todos'
import styles from './MeetingsComponent.module.css'
import { useAuth } from '../../store/auth-context'

import { Link } from 'react-router-dom'

const MeetingsComponent = ({activeOrganisation}) => {
  
  console.log('active org: ', activeOrganisation)
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Meetings</h1>
      <Link to={`/organisations/${activeOrganisation}`}><div className={styles.title}>Active Organisation: {activeOrganisation}</div></Link>
      <div className={styles.title}>Go to settings to change your active organisation</div>
      <div></div>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search in meetings..."
          className={styles.searchInput}
        />
      </div>
      <div className={styles.blankSection}>
        <UploadMeeting organisationName={activeOrganisation} />
      </div>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Meeting List</h2>
        <MeetingList organisationName={activeOrganisation} />
      </div>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Todos across organisation</h2>
        <Todos organisation={activeOrganisation} />
      </div>
    </div>
  )
}

export default MeetingsComponent
