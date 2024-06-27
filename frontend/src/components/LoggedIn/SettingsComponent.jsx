import React from 'react'

const SettingsComponent = ({user}) => {
  return (
    <div>
      <h1>Settings</h1>
      <div>
        <div>Username: {user.username}</div>
        <div>Email: {user.email}</div>
        <div>Display Name</div>
        <div>Bio</div>
      </div>
      <div>
        <div>Update profile</div>
      </div>
      <div>
        <div>Organisations created by me</div>
        <div>organisation 1</div>
        <div>organisation 2</div>
      </div>
      
    </div>
  )
}

export default SettingsComponent
