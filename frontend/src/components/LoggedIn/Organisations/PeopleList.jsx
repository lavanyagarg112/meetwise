import React from 'react'
import classes from './PeopleList.module.css'

const PeopleList = ({ people, currentUser, role }) => {
  return (
    <div className={classes.peopleListContainer}>
      {!people || people.length === 0 ? (
        <div className={classes.noPeopleMessage}>None Yet.</div>
      ) : (
        people.map((person) => (
          <div key={person.id} className={classes.personContainer}>
            <div className={classes.personName}>{person.username}</div>
            {role !== 'user' && <div className={classes.modifyRole}>Modify Role</div>}
            <div className={classes.profileLink}>
              {person.id === currentUser.id ? 'My Profile' : 'View Profile'}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default PeopleList
