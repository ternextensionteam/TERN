import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TodoList from "./TodoList";

describe("TodoList Component", () => {
  let mockOnDeleteTask, mockOnToggleReminder, mockOnUpdateTask, sampleTasks;

  beforeEach(() => {
    mockOnDeleteTask = jest.fn();
    mockOnUpdateTask = jest.fn();

    sampleTasks = [
      {
        id: 1,
        text: "Task 1",
        description: "Description 1",
        completed: false,
        hasReminder: false,
        dueDate: "2025-03-20T12:00:00.000Z",
      },
      {
        id: 2,
        text: "Task 2",
        description: "Description 2",
        completed: true,
        hasReminder: true,
        dueDate: "2025-03-22T14:30:00.000Z",
      },
    ];
  });

  const renderTodoList = (tasks = sampleTasks) => {
    render(
      <TodoList
        tasks={tasks}
        onDeleteTask={mockOnDeleteTask}
        onToggleReminder={mockOnToggleReminder}
        onUpdateTask={mockOnUpdateTask}
      />
    );
  };

  test("renders the todo list", () => {
    renderTodoList();

    expect(screen.getByLabelText("To-Do List")).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(sampleTasks.length);
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
  });

  test("renders empty state when no tasks are provided", () => {
    renderTodoList([]); // Passing an empty array

    const list = screen.getByTestId("todo-list");
    expect(list).toBeInTheDocument();
    expect(list.childElementCount).toBe(0); // Should render no tasks
  });

  test("calls onDeleteTask when delete button is clicked", async () => {
    renderTodoList();
    const deleteButtons = screen.getAllByTestId("delete-button");
    console.log(deleteButtons[0]);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
        expect(mockOnDeleteTask).toHaveBeenCalledWith(1);
    });
  });

  test("calls onUpdateTask when a task checkbox is clicked", () => {
    renderTodoList();

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);

    expect(mockOnUpdateTask).toHaveBeenCalledWith(
      1,
      "Task 1",
      "Description 1",
      false,
      "2025-03-20T12:00:00.000Z",
      true // Task should now be marked as completed
    );
  });
});
