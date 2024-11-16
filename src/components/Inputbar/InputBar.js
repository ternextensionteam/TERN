import React, { useState } from 'react';

function InputBar({ onAddTask }) {
    const [taskText, setTaskText] = useState('');

    const handleAdd = () => {
        onAddTask(taskText);
        setTaskText(''); // Clear input after adding
    };

    return (
        <div className="input-bar">
            <input
                type="text"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                placeholder="Add a task..."
            />
            <button onClick={handleAdd}>Add Task</button>
        </div>
    );
}

export default InputBar;
