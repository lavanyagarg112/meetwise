import React, { useEffect, useState } from 'react'

const MeetingTodos = ({organisation, meetingid}) => {

  const [meetingTodos, setMeetingTodos] = useState([])


  const getMeetingTodos = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-meeting-todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meetingid, organisation }),
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('An error occurred fetching the transcription.');
      }

      const data = await response.json()
      setMeetingTodos(data.todos)

    } catch (error) {
      console.log('error: ', error)
    }
  }

  const addTodos = async (details, deadline, assigner, assignee, isCompleted) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/add-todo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          meetingid,
          organisation,
          details,
          deadline,
          assigner,
          assignee,
          isCompleted
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('An error occurred fetching the transcription.');
      }

      const data = await response.json()
      setMeetingTodos([...meetingTodos, data])

    } catch (error) {
      console.log('error: ', error)
    }
  }

  const editTodos = async (todoid, details, deadline, assigner, assignee, isCompleted) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/edit-todo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          meetingid,
          organisation,
          todoid,
          details,
          deadline,
          assigner,
          assignee,
          isCompleted
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('An error occurred fetching the transcription.');
      }

      const data = await response.json()
      finalData = []
      meetingTodos.map((todo) => {
        todo.id === data.id ? finalData.append(data) : finalData.append(todo)
      })
      setMeetingTodos(finalData)

    } catch (error) {
      console.log('error: ', error)
    }
  }

  const deleteTodos = async (todoid) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/delete-todo`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingid,
          organisation,
          todoid
        }),
        credentials: 'include'
        
      })
      const data = await response.data()

    } catch (error) {
      console.log("error: ", error)
    }
  }

  return (
    <div>
      Specific meeting todos
    </div>
  )
}

export default MeetingTodos
