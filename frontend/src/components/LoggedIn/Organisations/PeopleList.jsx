import React from 'react'
import classes from './PeopleList.module.css'

import { Link } from 'react-router-dom'

const PeopleList = ({ people, currentUser, role }) => {

  console.log("people: ", people)

  const handleModify = () => {
    alert("Coming soon!")
  }

  return (
    <div className={classes.peopleListContainer}>
      {!people || people.length === 0 ? (
        <div className={classes.noPeopleMessage}>None Yet.</div>
      ) : (
        people.map((person) => (
          <div key={person.id} className={classes.personContainer}>
            <div className={classes.personName}>{person.username}</div>
            <div className={classes.rightSection}>
              {role !== 'user' && <div className={classes.modifyRole} onClick={handleModify}>Modify Role</div>}
              <Link to={`/user/${person.username}`}>
                <div className={classes.profileLink}>
                  {person.id === currentUser.id ? 'My Profile' : 'View Profile'}
                </div>
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default PeopleList
