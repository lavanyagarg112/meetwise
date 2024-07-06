import React from 'react'

const HomeUser = ({user}) => {


  const getAllTodos = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-user-todos`, {
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include' 
        })

        if (!response.ok) {
          throw new Error('An error occurred fetching the todos.');
        }

        const data = await response.json()

      } catch (error) {
        console.log("error: ", error)
      }
  }

  return (

    <div>
        {user.firstName} {user.lastName}
        <div>Show todo calendar</div>
        <div>Upcoming tasks</div>
        <div>Direct link to go to organisations page</div>
    </div>
  )
}

export default HomeUser
