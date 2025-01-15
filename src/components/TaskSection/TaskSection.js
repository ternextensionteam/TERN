import React, { useEffect } from 'react';
import { useTodoList } from '../../hooks/useTodoList/useTodoList';
import TodoList from '../TodoList/TodoList';
import InputBar from '../Inputbar/InputBar';

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
            <button onClick={saveTasks} id="save-tasks">Save Tasks</button>
        </div>
    );
}

export default TaskSection;
