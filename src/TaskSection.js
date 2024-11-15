import React, { useEffect } from 'react';
import { useTodoList } from './useTodoList';
import TodoList from './TodoList';
import InputBar from './InputBar';

function TaskSection() {
    const { tasks, addTask, deleteTask, saveTasks, loadTasks } = useTodoList();

    // Load tasks from localStorage when the component mounts
    useEffect(() => {
        loadTasks();
    }, []);

    return (
        <div className="sidebar container p-3">
            <InputBar onAddTask={addTask} />
            <TodoList tasks={tasks} onDeleteTask={deleteTask} />
            <button onClick={saveTasks}>Save Tasks</button>
        </div>
    );
}

export default TaskSection;
