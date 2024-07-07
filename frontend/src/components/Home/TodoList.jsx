import React from 'react';
import classes from './TodoList.module.css';

const TodoList = ({ todos }) => {
  return (
    <ul className={classes.todoList}>
      {todos.map(todo => (
        <li key={todo.id} className={classes.todoItem}>
          <span className={classes.todoTitle}>{todo.details}</span>
          <span className={classes.todoDate}>{new Date(todo.deadline).toLocaleDateString()}</span>
        </li>
      ))}
    </ul>
  );
};

export default TodoList;