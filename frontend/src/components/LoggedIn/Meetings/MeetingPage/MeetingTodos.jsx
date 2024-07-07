import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../../store/auth-context';
import Loading from '../../../ui/Loading';
import CollapsibleSection from '../../../ui/CollapsableSection';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './MeetingTodos.module.css';
import moment from 'moment';

const MeetingTodos = ({ organisation, meetingid, type, team }) => {
  const [meetingTodos, setMeetingTodos] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [newTodo, setNewTodo] = useState({ details: '', deadline: '', assignee: '' });
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterAssignee, setFilterAssignee] = useState(null);
  const [filterAssigner, setFilterAssigner] = useState(null);
  const [editablePeople, setEditablePeople] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)

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
      setMeetingTodos(data.map((item) => !item.deadline ? {id: item.id, details: item.details, deadline: new Date(), assigner: item.assigner, assignee: item.assignee, isCompleted: item.isCompleted} : item));

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
      setEditablePeople([...data.organisation.owners, ...data.organisation.admins])
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
      setPeople([...data.team.admins, ...data.team.users]);
      setEditablePeople(data.team.admins)
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

  const filterTodos = (todos) => {
    return todos
      .filter((todo) => {
        if (filterStatus === 'completed') return todo.isCompleted;
        if (filterStatus === 'active') return !todo.isCompleted;
        return true;
      })
      .filter((todo) => {
        if (filterAssignee) return todo.assignee.id === filterAssignee;
        return true;
      })
      .filter((todo) => {
        if (filterAssigner) return todo.assigner.id === filterAssigner;
        return true;
      });
  };

  const RenderTodo = ({ todo }) => {
    const { id, details, deadline, assigner, assignee, isCompleted } = todo;
    const canEditTodo = (assigner && user.id === assigner.id) || (assignee && user.id === assignee.id) || editablePeople.find(person => person.id === user.id) || !assignee || !assigner;
    setIsAdmin(editablePeople.find(person => person.id === user.id))
    const [isEditing, setIsEditing] = useState(false);
    const [localTodo, setLocalTodo] = useState({ ...todo });
  
    useEffect(() => {
      setLocalTodo({ ...todo });
    }, [todo]);
  
    const handleLocalEditTodo = (updatedFields) => {
      setLocalTodo((prevTodo) => ({
        ...prevTodo,
        ...updatedFields,
      }));
    };
  
    const handleSave = () => {
      setIsEditing(false);
      handleSaveTodo(localTodo);
    };
  
    return (
      <div key={id} className={styles.todoRow}>
        <input
          type="checkbox"
          checked={localTodo.isCompleted}
          onChange={(e) => handleLocalEditTodo({ isCompleted: e.target.checked })}
          disabled={!canEditTodo || !isEditing}
          className={styles.todoCheckbox}
        />
        {/* <input
          type="text"
          value={localTodo.details}
          onChange={(e) => handleLocalEditTodo({ details: e.target.value })}
          disabled={!canEditTodo || !isEditing}
          className={styles.todoInput}
        /> */}
        <textarea
        value={localTodo.details}
        onChange={(e) => handleLocalEditTodo({ details: e.target.value })}
        disabled={!canEditTodo || !isEditing}
        className={styles.todoDetails}
        />
        <DatePicker
          selected={new Date(localTodo.deadline)}
          onChange={(date) => handleLocalEditTodo({ deadline: date.toISOString() })}
          showTimeSelect
          dateFormat="Pp"
          disabled={!canEditTodo || !isEditing}
          className={styles.todoDatePicker}
        />
        {localTodo.assigner ? (localTodo.assigner.id === user.id ? (
          <Select
          value={localTodo.assigner ? { value: localTodo.assigner.id, label: `${localTodo.assigner.firstName} ${localTodo.assigner.lastName}` } : { value: '', label: '' }}
          onChange={(selectedOption) => {
            const selectedPerson = people.find((p) => p.id === selectedOption.value);
            handleLocalEditTodo({ assigner: selectedPerson });
          }}
          // options={people.map((person) => ({
          //   value: person.id,
          //   label: `${person.firstName} ${person.lastName} - ${person.username} - ${person.email}`,
          // }))}
          options={[{value: user.id, label: `${user.firstName} ${user.lastName} (${user.username} - ${user.email})`}]}
          isDisabled={!canEditTodo || !isEditing}
          className={styles.todoSelect}
          />
        ) : (
            <Select
            value={localTodo.assigner ? { value: localTodo.assigner.id, label: `${localTodo.assigner.firstName} ${localTodo.assigner.lastName}` } : { value: '', label: '' }}
            onChange={(selectedOption) => {
              const selectedPerson = people.find((p) => p.id === selectedOption.value);
              handleLocalEditTodo({ assigner: selectedPerson });
            }}
            // options={people.map((person) => ({
            //   value: person.id,
            //   label: `${person.firstName} ${person.lastName} - ${person.username} - ${person.email}`,
            // }))}
            options={[{value: user.id, label: `${user.firstName} ${user.lastName} (${user.username} - ${user.email})`},
            {value: localTodo.assigner.id, label: `${localTodo.assigner.firstName} ${localTodo.assigner.lastName} (${localTodo.assigner.username} - ${localTodo.assigner.email})` }]}
            isDisabled={!canEditTodo || !isEditing}
            className={styles.todoSelect}
          />
        )) : (
          <Select
          value={{ value: '', label: '' }}
          onChange={(selectedOption) => {
            const selectedPerson = people.find((p) => p.id === selectedOption.value);
            handleLocalEditTodo({ assigner: selectedPerson });
          }}
          // options={people.map((person) => ({
          //   value: person.id,
          //   label: `${person.firstName} ${person.lastName} - ${person.username} - ${person.email}`,
          // }))}
          options={[{value: user.id, label: `${user.firstName} ${user.lastName} (${user.username} - ${user.email})`}]}
          isDisabled={!canEditTodo || !isEditing}
          className={styles.todoSelect}
          />
        )
        }
        <Select
          value={localTodo.assignee ? { value: localTodo.assignee.id, label: `${localTodo.assignee.firstName} ${localTodo.assignee.lastName}` } : { value: '', label: '' }}
          onChange={(selectedOption) => {
            const selectedPerson = people.find((p) => p.id === selectedOption.value);
            handleLocalEditTodo({ assignee: selectedPerson });
          }}
          options={people.map((person) => ({
            value: person.id,
            label: `${person.firstName} ${person.lastName} (${person.username} - ${person.email})`,
          }))}
          isDisabled={!canEditTodo || !isEditing}
          className={styles.todoSelect}
        />
        
        <div className={styles.todoActions}>
          <button
            onClick={isEditing && (!localTodo.deadline || !localTodo.assigner || !localTodo.assignee) ? () => {setIsEditing(false); setLocalTodo(todo)} : !isEditing ? () => setIsEditing(true) : handleSave}
            className={styles.todoButton}
            disabled={!canEditTodo}
          >
            { isEditing && (!localTodo.deadline || !localTodo.assigner || !localTodo.assignee) ? 'Cancel' : isEditing ? 'Save' : 'Edit'}
          </button>
          <button onClick={() => handleDeleteTodo(id)} className={styles.todoButton} disabled={!canEditTodo}>Delete</button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <CollapsibleSection title="Meeting Todos" onToggle={() => {}}>
      {loading && <Loading />}
      <div className={styles.filterContainer}>
        <Select
          placeholder="Filter by Status"
          options={[{ value: null, label: 'Filter by Status' }, { value: 'completed', label: 'Completed' }, { value: 'active', label: 'Active' }]}
          onChange={(selectedOption) => setFilterStatus(selectedOption ? selectedOption.value : null)}
          className={styles.filterSelect}
        />
        <Select
          placeholder="Filter by Assignee"
          options={[{ value: null, label: 'Filter by Assignee' }, ...people.map((person) => ({
            value: person.id,
            label: `${person.firstName} ${person.lastName} (${person.username} - ${person.email})`
          }))]}
          onChange={(selectedOption) => setFilterAssignee(selectedOption ? selectedOption.value : null)}
          className={styles.filterSelect}
        />
        <Select
          placeholder="Filter by Assigner"
          options={[{ value: null, label: 'Filter by Assigner' }, ...people.map((person) => ({
            value: person.id,
            label: `${person.firstName} ${person.lastName} (${person.username} - ${person.email})`
          }))]}
          onChange={(selectedOption) => setFilterAssigner(selectedOption ? selectedOption.value : null)}
          className={styles.filterSelect}
        />
      </div>
      <div className={styles.addTodoForm}>
        <input
          type="text"
          placeholder="Details"
          value={newTodo.details}
          onChange={(e) => setNewTodo({ ...newTodo, details: e.target.value })}
          className={styles.todoInput}
          required
        />
        <DatePicker
          selected={newTodo.deadline ? new Date(newTodo.deadline) : null}
          onChange={(date) => setNewTodo({ ...newTodo, deadline: date.toISOString() })}
          showTimeSelect
          dateFormat="yyyy-MM-dd HH:mm"
          placeholderText="yyyy-mm-dd hh:mm"
          required
          className={styles.todoDatePicker}
          minDate={moment().toDate()}
          timeFormat="HH:mm"
          timeIntervals={15}
        />
        <Select
          value={newTodo.assignee ? { value: newTodo.assignee, label: people.find(p => p.id === newTodo.assignee).firstName + ' ' + people.find(p => p.id === newTodo.assignee).lastName + ' - ' + people.find(p => p.id === newTodo.assignee).username + ' - ' + people.find(p => p.id === newTodo.assignee).email } : null}
          onChange={(selectedOption) => setNewTodo({ ...newTodo, assignee: selectedOption.value })}
          options={people.map((person) => ({
            value: person.id,
            label: `${person.firstName} ${person.lastName} (${person.username} - ${person.email})`
          }))}
          placeholder="Select Assignee"
          className={styles.todoSelect}
          required
        />
        <button onClick={handleAddTodo} className={styles.todoButton} disabled={!newTodo.details || !newTodo.deadline || !newTodo.assignee}>Add Todo</button>
      </div>
      <div className={styles.todosContainer}>
        <div className={styles.todosHeader}>
          <span></span>
          <span>Details</span>
          <span>Deadline</span>
          <span>Assigner</span>
          <span>Assignee</span>
          <span>Actions</span>
        </div>
        {filterTodos(meetingTodos).map((todo) => <RenderTodo todo={todo} />)}
      </div>
    </CollapsibleSection>
  );
};

export default MeetingTodos;
