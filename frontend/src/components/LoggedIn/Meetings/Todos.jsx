import React, { useState } from 'react'

const Todos = ({ organisation }) => {

  const [todos, setTodos] = useState([])

  const getTodos = async () => {
    try {

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-all-user-todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: organisation }),
        credentials: 'include',
      })

      const data = await response.json()
      setTodos(data)

    } catch (error) {
      console.log("error: ", error)
    }
  }

  return (
    <div>
      
    </div>
  )
}

export default Todos
