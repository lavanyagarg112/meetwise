import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../../store/auth-context';
import Loading from '../../../ui/Loading';
import CollapsibleSection from '../../../ui/CollapsableSection';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './MeetingTodos.module.css';

const MeetingTodos = ({ organisation, meetingid, type, team }) => {
  const [meetingTodos, setMeetingTodos] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [newTodo, setNewTodo] = useState({ details: '', deadline: '', assignee: '' });

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-meeting-todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meetingid, organisation }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('An error occurred fetching the todos.');
      }

      const data = await response.json();
      setMeetingTodos([...data.todos.assigner, ...data.todos.assignee]);
    } catch (error) {
      console.log('error: ', error);
    }
    setLoading(false);
  }, [meetingid, organisation]);

  useEffect(() => {
    if (type === 'organisation') {
      getOrganisationInfo();
    } else {
      getTeamInfo();
    }
  }, [type]);

  const getOrganisationInfo = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/organisationpage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: organisation }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('An error occurred fetching the organisation info.');
      }

      const data = await response.json();
      setPeople([...data.organisation.owners, ...data.organisation.admins, ...data.organisation.users]);
    } catch (error) {
      console.log('ERROR', error);
    }
  };

  const getTeamInfo = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/teampage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: team, organisation }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('An error occurred fetching the team info.');
      }

      const data = await response.json();
      setPeople([...data.team.members]);
    } catch (error) {
      console.log('ERROR', error);
    }
  };

  const handleEditTodo = (todo) => {
    setMeetingTodos((prevTodos) =>
      prevTodos.map((t) => (t.id === todo.id ? { ...t, ...todo } : t))
    );
  };

  const handleSaveTodo = async (todo) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/edit-todo`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingid,
          organisation,
          todoid: todo.id,
          details: todo.details,
          deadline: todo.deadline,
          assigner: todo.assigner.id,
          assignee: todo.assignee.id,
          isCompleted: todo.isCompleted,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('An error occurred updating the todo.');
      }

      const data = await response.json();
      setMeetingTodos((prevTodos) =>
        prevTodos.map((t) => (t.id === todo.id ? todo : t))
      );
    } catch (error) {
      console.log('error:', error);
    }

    // remove once endpoint created
    setMeetingTodos((prevTodos) =>
      prevTodos.map((t) => (t.id === todo.id ? todo : t))
    );
  };

  const handleDeleteTodo = async (todoid) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/delete-todo`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingid,
          organisation,
          todoid,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('An error occurred deleting the todo.');
      }

      setMeetingTodos((prevTodos) => prevTodos.filter((t) => t.id !== todoid));
    } catch (error) {
      console.log('error:', error);
    }

    // remove once endpoint created
    setMeetingTodos((prevTodos) => prevTodos.filter((t) => t.id !== todoid));
  };

  const handleAddTodo = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/add-todo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingid,
          organisation,
          details: newTodo.details,
          deadline: newTodo.deadline,
          assigner: user.id,
          assignee: newTodo.assignee,
          isCompleted: false,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('An error occurred adding the todo.');
      }

      const data = await response.json();
      setMeetingTodos((prevTodos) => [...prevTodos, data]);
      setNewTodo({ details: '', deadline: '', assignee: '' });
    } catch (error) {
      console.log('error:', error);
    }

    setNewTodo({ details: '', deadline: '', assignee: '' });
  };

  const renderTodo = (todo) => {
    const { id, details, deadline, assigner, assignee, isCompleted } = todo;
    const canEditTodo = user.id === assigner.id || user.id === assignee.id;

    return (
      <div key={id} className={styles.todoRow}>
        <input
          type="text"
          value={details}
          onChange={(e) => handleEditTodo({ ...todo, details: e.target.value })}
          disabled={!canEditTodo}
          className={styles.todoInput}
        />
        <DatePicker
          selected={new Date(deadline)}
          onChange={(date) => handleEditTodo({ ...todo, deadline: date.toISOString() })}
          showTimeSelect
          dateFormat="Pp"
          disabled={!canEditTodo}
          className={styles.todoDatePicker}
        />
        <input
          type="text"
          value={`${assigner.firstName} ${assigner.lastName}`}
          disabled
          className={styles.todoInput}
        />
        <Select
          value={{ value: assignee.id, label: `${assignee.firstName} ${assignee.lastName} - ${assignee.username} - ${assignee.email}` }}
          onChange={(selectedOption) => {
            const selectedPerson = people.find((p) => p.id === selectedOption.value);
            handleEditTodo({ ...todo, assignee: selectedPerson });
          }}
          options={people.map((person) => ({
            value: person.id,
            label: `${person.firstName} ${person.lastName} - ${person.username} - ${person.email}`
          }))}
          isDisabled={!canEditTodo}
          className={styles.todoSelect}
        />
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={(e) => handleEditTodo({ ...todo, isCompleted: e.target.checked })}
          disabled={!canEditTodo}
          className={styles.todoCheckbox}
        />
        {canEditTodo && (
          <>
            <button onClick={() => handleSaveTodo(todo)} className={styles.todoButton}>Save</button>
            <button onClick={() => handleDeleteTodo(id)} className={styles.todoButton}>Delete</button>
          </>
        )}
      </div>
    );
  };

  return (
    <CollapsibleSection title="Meeting Todos" onToggle={fetchTodos}>
      {loading && <Loading />}
      <div className={styles.addTodoForm}>
        <input
          type="text"
          placeholder="Details"
          value={newTodo.details}
          onChange={(e) => setNewTodo({ ...newTodo, details: e.target.value })}
          className={styles.todoInput}
        />
        <DatePicker
          selected={newTodo.deadline ? new Date(newTodo.deadline) : null}
          onChange={(date) => setNewTodo({ ...newTodo, deadline: date.toISOString() })}
          showTimeSelect
          dateFormat="Pp"
          placeholderText="Select Deadline"
          className={styles.todoDatePicker}
        />
        <Select
          value={newTodo.assignee ? { value: newTodo.assignee, label: people.find(p => p.id === newTodo.assignee).firstName + ' ' + people.find(p => p.id === newTodo.assignee).lastName + ' - ' + people.find(p => p.id === newTodo.assignee).username + ' - ' + people.find(p => p.id === newTodo.assignee).email } : null}
          onChange={(selectedOption) => setNewTodo({ ...newTodo, assignee: selectedOption.value })}
          options={people.map((person) => ({
            value: person.id,
            label: `${person.firstName} ${person.lastName} - ${person.username} - ${person.email}`
          }))}
          placeholder="Select Assignee"
          className={styles.todoSelect}
        />
        <button onClick={handleAddTodo} className={styles.todoButton}>Add Todo</button>
      </div>
      <div className={styles.todosContainer}>
        <div className={styles.todosHeader}>
          <span>Details</span>
          <span>Deadline</span>
          <span>Assigner</span>
          <span>Assignee</span>
          <span>Completed</span>
        </div>
        {meetingTodos.map((todo) => renderTodo(todo))}
      </div>
    </CollapsibleSection>
  );
};

export default MeetingTodos;
