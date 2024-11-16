import { useState } from 'react';

export function useTodoList() {
    const [tasks, setTasks] = useState([]);

    const addTask = (taskText) => {
        if (taskText.trim() === '') return;
        setTasks([...tasks, { id: Date.now(), text: taskText }]);
    };

    const deleteTask = (taskId) => {
        setTasks(tasks.filter(task => task.id !== taskId));
    };

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const loadTasks = () => {
        const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        setTasks(savedTasks);
    };

    return { tasks, addTask, deleteTask, saveTasks, loadTasks };
}