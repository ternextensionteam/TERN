import React from 'react';
import TodoItem from '../TodoItem/TodoItem';

function TodoList({ tasks, onDeleteTask,onToggleReminder}) {
    return (
        <ul aria-label="To-Do List" data-testid="todo-list" className="list-group todo-list">
            {tasks.map(task => (
                <TodoItem 
                    key={task.id}
                    task={task} 
                    onDelete={onDeleteTask}
                    onEdit={(id) => console.log(`TODO implement Edit task with ID: ${id}`)}
                    onToggleReminder={onToggleReminder}
                    
                />
            ))}
        </ul>
    );
}

export default TodoList;