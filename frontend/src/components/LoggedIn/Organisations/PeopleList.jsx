import React from 'react'

const PeopleList = ({people, currentUser}) => {
  return (
    <div>
      {!people || people.length === 0 ? <div>None Yet.</div> : (

        people.map((person) =>
            <div>
                <div>{person.username}</div>
                {person.id === currentUser.id ? <div>My Profile</div> : <div>View Profile</div>}
            </div>
        )

      )}
    </div>
  )
}

export default PeopleList
