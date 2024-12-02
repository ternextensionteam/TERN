import React, { useEffect } from 'react';
import { useTodoList } from '../../hooks/useTodoList/useTodoList';
import TodoList from '../TodoList/TodoList';
import InputBar from '../Inputbar/InputBar';

function TaskSection() {
    const { tasks, addTask, deleteTask, toggleReminder, saveTasks, loadTasks, updateTask } = useTodoList();

    return (
        <div>
            <InputBar onAddTask={addTask} />
            <TodoList tasks={tasks} onDeleteTask={deleteTask} onToggleReminder={toggleReminder} onUpdateTask={updateTask}/>
            {/* <button onClick={saveTasks}>Save Tasks</button> */}
        </div>
    );
}

export default TaskSection;
