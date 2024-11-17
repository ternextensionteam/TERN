import { useState } from 'react';

export function useTodoList() {
    const [tasks, setTasks] = useState([]);

    const addTask = (taskText, dueDate='', dueTime='', description = '',reminder=false) => {
        if (taskText.trim() === '') return;

        let due = null;
        if (dueDate && dueTime) {
            // Combine dueDate and dueTime into a Date object
            due = new Date(`${dueDate}T${dueTime}`);
        }

        const newTask = {
            id: Date.now(),
            text: taskText,
            due: due,
            description:description,
            reminder:reminder
        }
        //console.log(due.toString())
        setTasks([...tasks, newTask]);
        saveTasks();
    };

    const deleteTask = (taskId) => {
        setTasks(tasks.filter(task => task.id !== taskId));
        saveTasks();
    };

    const saveTasks = () => {
        chrome.storage.local.set({ tasks });
    };

    const loadTasks = () => {
        chrome.storage.local.get(['tasks'], (result) => {
            if (result.tasks) {
                setTasks(result.tasks);
            }
        });
    };

    return { tasks, addTask, deleteTask, saveTasks, loadTasks };
}