import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import TodoList from './TodoList.jsx';
import classes from './HomeUser.module.css';

const localizer = momentLocalizer(moment);

const HomeUser = ({ user }) => {
  const [todos, setTodos] = useState([]);
  const [showTodoList, setShowTodoList] = useState(false);

  useEffect(() => {
    getAllTodos();
  }, []);

  const getAllTodos = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-user-todos`, {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' 
      });
      if (!response.ok) {
        throw new Error('An error occurred fetching the todos.');
      }
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.log("error: ", error);
    }

    // to be removed once endpoint works
    const data = [
      {
          "id": 1,
          "details": "todo1",
          "deadline": "2024-07-12 14:30:00",
          "assigner": {
              "id": 46,
              "email": "user1@email.com",
              "username": "user1",
              "firstName": "user1",
              "lastName": "user1"
          },
          "assignee": {
              "id": 46,
              "email": "user1@email.com",
              "username": "user1",
              "firstName": "user1",
              "lastName": "user1"
          },
          "isCompleted": false
      },
      {
          "id": 4,
          "details": "todo2",
          "deadline": "2024-07-18 16:15:00",
          "assigner": {
              "id": 46,
              "email": "user1@email.com",
              "username": "user1",
              "firstName": "user1",
              "lastName": "user1"
          },
          "assignee": {
              "id": 48,
              "email": "user@email.com",
              "username": "user",
              "firstName": "user",
              "lastName": "user"
          },
          "isCompleted": false
      },
      {
          "id": 6,
          "details": "todo3",
          "deadline": "2024-07-17 16:30:00",
          "assigner": {
              "id": 46,
              "email": "user1@email.com",
              "username": "user1",
              "firstName": "user1",
              "lastName": "user1"
          },
          "assignee": {
              "id": 48,
              "email": "user@email.com",
              "username": "user",
              "firstName": "user",
              "lastName": "user"
          },
          "isCompleted": false
      },
      {
          "id": 7,
          "details": "todo1",
          "deadline": "2024-07-06 09:45:00",
          "assigner": {
              "id": 46,
              "email": "user1@email.com",
              "username": "user1",
              "firstName": "user1",
              "lastName": "user1"
          },
          "assignee": {
              "id": 48,
              "email": "user@email.com",
              "username": "user",
              "firstName": "user",
              "lastName": "user"
          },
          "isCompleted": false
      },
      {
          "id": 8,
          "details": "todo 1 with them",
          "deadline": "2024-07-06 01:30:00",
          "assigner": {
              "id": 46,
              "email": "user1@email.com",
              "username": "user1",
              "firstName": "user1",
              "lastName": "user1"
          },
          "assignee": {
              "id": 48,
              "email": "user@email.com",
              "username": "user",
              "firstName": "user",
              "lastName": "user"
          },
          "isCompleted": true
      },
      {
          "id": 9,
          "details": "todo2",
          "deadline": "2024-07-06 10:15:00",
          "assigner": {
              "id": 46,
              "email": "user1@email.com",
              "username": "user1",
              "firstName": "user1",
              "lastName": "user1"
          },
          "assignee": {
              "id": 48,
              "email": "user@email.com",
              "username": "user",
              "firstName": "user",
              "lastName": "user"
          },
          "isCompleted": false
      },
      {
          "id": 10,
          "details": "todo new",
          "deadline": "2024-07-06 11:30:00",
          "assigner": {
              "id": 48,
              "email": "user@email.com",
              "username": "user",
              "firstName": "user",
              "lastName": "user"
          },
          "assignee": {
              "id": 48,
              "email": "user@email.com",
              "username": "user",
              "firstName": "user",
              "lastName": "user"
          },
          "isCompleted": false
      }
  ]

  setTodos(data)


  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const calendarEvents = todos.map(todo => ({
    title: truncateText(todo.details, 30),
    start: new Date(todo.deadline),
    end: new Date(todo.deadline),
    allDay: true,
  }));

  return (
    <div className={classes.dashboardContainer}>
      <h1 className={classes.welcomeMessage}>Welcome, {user.firstName} {user.lastName}!</h1>
      
      <div className={classes.dashboardContent}>
        <div className={classes.calendarCard}>
          <h2>Calendar</h2>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
          />
        </div>

        <div className={classes.sidebar}>
          <div className={classes.upcomingTasksCard}>
            <h2>Upcoming Tasks</h2>
            <button
              onClick={() => setShowTodoList(!showTodoList)}
              className={classes.toggleButton}
            >
              {showTodoList ? 'Hide Todo List' : 'Show Todo List'}
            </button>
            {showTodoList && <TodoList todos={todos} />}
          </div>

          <div className={classes.organizationsCard}>
            <h2>My Organisations</h2>
            <a href="/organisations" className={classes.organizationsButton}>Go to Organisations</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeUser;