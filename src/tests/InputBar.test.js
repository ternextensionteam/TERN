import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InputBar from '../components/InputBar/InputBar';

let mockAddTask;

beforeEach(() => {
    mockAddTask = jest.fn();
    render(<InputBar onAddTask={mockAddTask} />);
});

test('renders the InputBar component correctly', () => {
    expect(screen.getByPlaceholderText(/task title/i)).toBeInTheDocument();
    expect(screen.getByText(/add new to-do list task/i)).toBeInTheDocument();

    // Check for preset buttons
    const presetButtons = screen.getAllByRole('radio');
    expect(presetButtons.length).toBe(3);

    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
});

test('allows user to input a task title', () => {
    const taskInput = screen.getByPlaceholderText(/task title/i);
    fireEvent.change(taskInput, { target: { value: 'Test Task' } });
    expect(taskInput.value).toBe('Test Task');
});

test('handles preset selection and updates due date and time', () => {
    const todayPreset = screen.getByText(/today/i);
    fireEvent.click(todayPreset);

    // Check if a radio input is selected
    const checkedRadio = screen.getAllByRole('radio').find(radio => radio.checked);
    expect(checkedRadio).toBeDefined();
    expect(checkedRadio.value).toContain('23:59');
});

test('toggles the reminder checkbox', () => {
    const reminderCheckbox = screen.getByRole('checkbox');
    expect(reminderCheckbox).toBeChecked();

    fireEvent.click(reminderCheckbox);
    expect(reminderCheckbox).not.toBeChecked();

    fireEvent.click(reminderCheckbox);
    expect(reminderCheckbox).toBeChecked();
});

test('submits a task with the correct values', () => {
    const taskInput = screen.getByPlaceholderText(/task title/i);
    const addButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(taskInput, { target: { value: 'Test Task' } });
    fireEvent.click(addButton);

    expect(mockAddTask).toHaveBeenCalledWith('Test Task', expect.any(String), expect.any(String), '', true);
});

test('clears the form after submission', () => {
    const taskInput = screen.getByPlaceholderText(/task title/i);
    const addButton = screen.getByRole('button', { name: /add task/i });
    const reminderCheckbox = screen.getByRole('checkbox');

    fireEvent.change(taskInput, { target: { value: 'Another Test Task' } });
    fireEvent.click(reminderCheckbox);
    fireEvent.click(addButton);

    expect(taskInput.value).toBe('');
    expect(reminderCheckbox).toBeChecked(); // Should reset to default (checked)
});
