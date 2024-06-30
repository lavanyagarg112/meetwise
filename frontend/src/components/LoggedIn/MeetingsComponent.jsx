import React from 'react'
import UploadMeeting from './Meetings/UploadMeeting'
import MeetingList from './Meetings/MeetingList'
import Todos from './Meetings/Todos'
import styles from './MeetingsComponent.module.css'

const MeetingsComponent = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Meetings</h1>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search in meetings..."
          className={styles.searchInput}
        />
      </div>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Upload Meeting</h2>
        <UploadMeeting />
      </div>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Meeting List</h2>
        <MeetingList />
      </div>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Todos</h2>
        <Todos />
      </div>
    </div>
  )
}

export default MeetingsComponent
