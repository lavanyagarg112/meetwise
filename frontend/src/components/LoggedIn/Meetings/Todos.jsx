import React, { useEffect, useState, useCallback } from 'react';
import Select from 'react-select';
import Loading from '../../ui/Loading';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './Todos.module.css';
import moment from 'moment';

const Todos = ({ organisation }) => {
  const [todos, setTodos] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterAssignee, setFilterAssignee] = useState(null);
  const [filterAssigner, setFilterAssigner] = useState(null);

  const getTodos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-all-user-todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: organisation }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('An error occurred fetching the todos.');
      }

      const data = await response.json();
      setTodos(data.map((item) => !item.deadline ? {id: item.id, details: item.details, deadline: new Date(), assigner: item.assigner, assignee: item.assignee, isCompleted: item.isCompleted} : item));
    } catch (error) {
      console.log('error: ', error);
    }
    setLoading(false);
  }, [organisation]);

  useEffect(() => {
    getTodos();
    getOrganisationInfo();
  }, []);

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

  const renderTodo = (todo) => {
    const { id, details, deadline, assigner, assignee, isCompleted } = todo;

    return (
      <div key={id} className={styles.todoRow}>
        <input
          type="checkbox"
          checked={isCompleted}
          disabled
          className={styles.todoCheckbox}
        />
        <span className={styles.todoText}>{details}</span>
        <span className={styles.todoText}>{moment(deadline).format('LLL')}</span>
        <span className={styles.todoText}>{assigner ? `${assigner.firstName} ${assigner.lastName}` : ''}</span>
        <span className={styles.todoText}>{assignee ?`${assignee.firstName} ${assignee.lastName}` : assignee}</span>
      </div>
    );
  };

  return (
    <div>
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
            label: `${person.firstName} ${person.lastName} - ${person.username} - ${person.email}`
          }))]}
          onChange={(selectedOption) => setFilterAssignee(selectedOption ? selectedOption.value : null)}
          className={styles.filterSelect}
        />
        <Select
          placeholder="Filter by Assigner"
          options={[{ value: null, label: 'Filter by Assigner' }, ...people.map((person) => ({
            value: person.id,
            label: `${person.firstName} ${person.lastName} - ${person.username} - ${person.email}`
          }))]}
          onChange={(selectedOption) => setFilterAssigner(selectedOption ? selectedOption.value : null)}
          className={styles.filterSelect}
        />
      </div>
      <div className={styles.todosContainer}>
        <div className={styles.todosHeader}>
          <span>Details</span>
          <span>Deadline</span>
          <span>Assigner</span>
          <span>Assignee</span>
        </div>
        {filterTodos(todos).map((todo) => renderTodo(todo))}
      </div>
    </div>
  );
};

export default Todos;

