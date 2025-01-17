import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoList from '../components/TodoList/TodoList';

let mockTasks;
let mockOnDelete;
let mockOnToggleReminder;

beforeEach(() => {
    mockTasks = [{ id: 1, text: 'Test Task', reminder: false }];
    mockOnDelete = jest.fn();
    mockOnToggleReminder = jest.fn();
});

test('renders task details correctly', () => {
    render(<TodoList tasks={mockTasks} onDeleteTask={mockOnDelete} onToggleReminder={mockOnToggleReminder} />);

    // Check if task text is rendered
    expect(screen.getByText('Test Task')).toBeInTheDocument();

    // Manually set task due date for test
    const today = new Date();
    today.setHours(23, 59, 0, 0);
    const formattedToday = today.toLocaleString('en-US', { hour12: true });

    mockTasks[0].due = today;
    render(<TodoList tasks={mockTasks} onDeleteTask={mockOnDelete} onToggleReminder={mockOnToggleReminder} />);

    // Use regex to match the due date instead of exact text
    expect(screen.getByText(/Due:\s*\d{1,2}\/\d{1,2}\/\d{4},?\s*\d{1,2}:\d{2}:\d{2}\s*(AM|PM)?/i)).toBeInTheDocument();
});

test('toggles task reminders correctly', () => {
    render(<TodoList tasks={mockTasks} onDeleteTask={mockOnDelete} onToggleReminder={mockOnToggleReminder} />);

    // Click the reminder button
    const reminderButton = screen.getByTitle('Toggle Reminder');
    fireEvent.click(reminderButton);

    // Ensure the toggle function was called
    expect(mockOnToggleReminder).toHaveBeenCalledTimes(1);
    expect(mockOnToggleReminder).toHaveBeenCalledWith(1);
});

test('deletes a task correctly', () => {
    render(<TodoList tasks={mockTasks} onDeleteTask={mockOnDelete} onToggleReminder={mockOnToggleReminder} />);

    // Check that task is rendered
    expect(screen.getByText('Test Task')).toBeInTheDocument();

    // Click the delete button
    const deleteButton = screen.getByTitle('Delete Task');
    fireEvent.click(deleteButton);

    // Ensure the delete function was called
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(1);
});

test('triggers edit functionality when the edit button is clicked', () => {
    console.log = jest.fn(); // Mock console.log

    render(<TodoList tasks={mockTasks} onDeleteTask={mockOnDelete} onToggleReminder={mockOnToggleReminder} />);

    // Click the edit button
    const editButton = screen.getByTitle('Edit Task');
    fireEvent.click(editButton);

    // Check if console.log was called with correct text
    expect(console.log).toHaveBeenCalledWith('TODO implement Edit task with ID: 1');
});
