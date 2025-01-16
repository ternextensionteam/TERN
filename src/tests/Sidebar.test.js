import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Sidebar from '../components/Sidebar/Sidebar';

test('Sidebar renders TaskSection correctly', () => {
    // Render the Sidebar component
    render(<Sidebar />);

    // Check if the Sidebar container is rendered
    const sidebar = screen.getByRole('complementary', { name: /sidebar/i });
    expect(sidebar).toBeInTheDocument();

    const taskSection = screen.getByTestId('task-section');
    expect(taskSection).toBeInTheDocument();
});

test('Sidebar renders TaskSection with key elements', () => {
    render(<Sidebar />);

    // Check for input bar
    const inputBar = screen.getByPlaceholderText(/task title/i); // Match placeholder text in the input
    expect(inputBar).toBeInTheDocument();

    // Check for todo list
    const todoList = screen.getByRole('list', { name: /to-do list/i }); // Match role and accessible name
    expect(todoList).toBeInTheDocument();

    // Check for save tasks button
    const saveTasksButton = screen.getByRole('button', { name: /save tasks/i }); // Match button text
    expect(saveTasksButton).toBeInTheDocument();
});