import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TodoItem from "../components/TodoItem/TodoItem";
import InputBar from "../components/InputBar/InputBar.js";

describe("TodoItem Component", () => {
  let mockTask, mockUpdateTask, mockDeleteTask;

  beforeEach(() => {
    mockTask = {
      id: 1,
      text: "Test Task",
      description: "Test Description",
      completed: false,
      reminder: { label: "No Reminder", time: null },
      dueDate: null,
    };

    mockUpdateTask = jest.fn();
    mockDeleteTask = jest.fn();
  });

  test("should render task title and description", () => {
    render(<TodoItem task={mockTask} onUpdateTask={mockUpdateTask} onDelete={mockDeleteTask} />);
    
    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  test("should toggle completion when clicking checkbox", () => {
    render(<TodoItem task={mockTask} onUpdateTask={mockUpdateTask} onDelete={mockDeleteTask} />);
    
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    
    expect(mockUpdateTask).toHaveBeenCalledWith(
      1,
      "Test Task",
      "Test Description",
      { label: "No Reminder", time: null },
      null,
      true
    );
  });

  test("should add a task only when title is provided", () => {
    const mockAddTask = jest.fn();
    render(<InputBar onAddTask={mockAddTask} />);
    
    const input = screen.getByPlaceholderText(/add a task/i);
    const addButton = screen.getByRole("button", { name: /add task/i });
    
    fireEvent.change(input, { target: { value: "New Task" } });
    fireEvent.click(addButton);
    
    expect(mockAddTask).toHaveBeenCalledWith("New Task", expect.any(Object), "", null);
  });

  test("should not add a task without title", () => {
    const mockAddTask = jest.fn();
    render(<InputBar onAddTask={mockAddTask} />);
    
    const addButton = screen.getByRole("button", { name: /add task/i });
    fireEvent.click(addButton);
    
    expect(mockAddTask).not.toHaveBeenCalled();
  });

  test("should not require due date or reminder time to add a task", () => {
    const mockAddTask = jest.fn();
    render(<InputBar onAddTask={mockAddTask} />);
    
    const input = screen.getByPlaceholderText(/add a task/i);
    fireEvent.change(input, { target: { value: "Task Without Due" } });
    fireEvent.click(screen.getByRole("button", { name: /add task/i }));
    
    expect(mockAddTask).toHaveBeenCalledWith("Task Without Due", expect.any(Object), "", null);
  });
});