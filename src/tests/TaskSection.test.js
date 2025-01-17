import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useTodoList } from '../hooks/useTodoList/useTodoList';
import TaskSection from '../components/TaskSection/TaskSection';

jest.mock('../hooks/useTodoList/useTodoList', () => ({
    useTodoList: jest.fn(),
}));

test('renders InputBar, TodoList, and Save Tasks button correctly', () => {
    // Mocking the `useTodoList` hook with empty tasks and jest mock functions
    useTodoList.mockReturnValue({
        tasks: [],
        addTask: jest.fn(),
        deleteTask: jest.fn(),
        saveTasks: jest.fn(),
        loadTasks: jest.fn(),
    });

    render(<TaskSection />);

    // Check if InputBar, TodoList, and Save Tasks button exist
    expect(screen.getByPlaceholderText('Task title')).toBeInTheDocument();
    expect(screen.getByTestId('todo-list')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Tasks' })).toBeInTheDocument();
});


test('adds a task and renders it in the task list', async () => {
    // Mock the initial state
    const mockAddTask = jest.fn();
    let mockTasks = [];

    useTodoList.mockReturnValue({
        tasks: mockTasks,
        addTask: mockAddTask,
        deleteTask: jest.fn(),
        saveTasks: jest.fn(),
        loadTasks: jest.fn(),
    });

    render(<TaskSection />);

    // Find and type into the task input field
    const taskInput = screen.getByPlaceholderText(/task title/i);
    fireEvent.change(taskInput, { target: { value: 'New Task' } });

    // Click the "Add Task" button
    const addButton = screen.getByRole('button', { name: /add task/i });
    fireEvent.click(addButton);

    // Ensure addTask function is called correctly
    expect(mockAddTask).toHaveBeenCalledWith('New Task', expect.any(String), expect.any(String), '', true);

    // Simulate the effect of adding a task
    mockTasks = [
        { id: 1, text: 'New Task', due: '', description: '', reminder: true },
    ];
    useTodoList.mockReturnValue({
        tasks: mockTasks, // Updated tasks
        addTask: mockAddTask,
        deleteTask: jest.fn(),
        saveTasks: jest.fn(),
        loadTasks: jest.fn(),
    });

    // Re-render the component with updated state
    render(<TaskSection />);

    // Ensure the new task appears in the task list asynchronously
    await waitFor(() => {
        expect(screen.getByText('New Task')).toBeInTheDocument();
    });
});


test('saves tasks correctly when clicking Save Tasks', () => {
    const mockSaveTasks = jest.fn();
    useTodoList.mockReturnValue({
        tasks: [{ id: 1, text: 'Task to Save' }],
        addTask: jest.fn(),
        deleteTask: jest.fn(),
        saveTasks: mockSaveTasks,
        loadTasks: jest.fn(),
    });

    render(<TaskSection />);

    // Click Save Tasks button
    const saveButton = screen.getByRole('button', { name: 'Save Tasks' });
    fireEvent.click(saveButton);

    // Check if saveTasks function was called
    expect(mockSaveTasks).toHaveBeenCalled();
});
