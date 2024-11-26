import React, { useEffect } from 'react';
import { useTodoList } from '../../hooks/useTodoList/useTodoList';
import TodoList from '../TodoList/TodoList';
import InputBar from '../Inputbar/InputBar';

function TaskSection() {
    const { tasks, addTask, deleteTask, toggleReminder, saveTasks, loadTasks } = useTodoList();

    // Load tasks from localStorage when the component mounts
    useEffect(() => {
        loadTasks();
    }, []);

    return (
        <div className="sidebar container p-3">
            <InputBar onAddTask={addTask} />
            <TodoList tasks={tasks} onDeleteTask={deleteTask} onToggleReminder={toggleReminder}/>
            <button onClick={saveTasks}>Save Tasks</button>
        </div>
    );
}

export default TaskSection;
