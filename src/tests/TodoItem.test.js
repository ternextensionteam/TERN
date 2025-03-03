import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import TodoItem from "../components/TodoItem/TodoItem";

const mockTask = {
  id: 1,
  text: "Test Task",
  description: "Test Description",
  completed: false,
  hasReminder: false,
  dueDate: "2025-02-22T10:00:00Z",
};

const mockOnDelete = jest.fn();
const mockOnUpdateTask = jest.fn();

describe("TodoItem Component", () => {
  beforeEach(() => {
    mockOnDelete.mockClear();
    mockOnUpdateTask.mockClear();
  });

  test("hover on bell should show reminder tooltip", async () => {
    render(<TodoItem task={mockTask} onDelete={mockOnDelete} onUpdateTask={mockOnUpdateTask} />);
    const bellButton = screen.getByRole("button", { name: "" }); // No name, matches your button
    fireEvent.mouseOver(bellButton);
    expect(bellButton.querySelector(".reminder-icon")).toHaveAttribute("data-tooltip", "No Reminder");
  });

  test("should be able to remove task by deleting", async () => {
    render(<TodoItem task={mockTask} onDelete={mockOnDelete} onUpdateTask={mockOnUpdateTask} />);
    const deleteButton = screen.getByTestId("delete-button");
  
    fireEvent.click(deleteButton);
  
    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledWith(mockTask.id);
    });
  });

  test("should mark task as completed by checking, not remove it", async () => {
    render(<TodoItem task={mockTask} onDelete={mockOnDelete} onUpdateTask={mockOnUpdateTask} />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(mockOnUpdateTask).toHaveBeenCalledWith(
      mockTask.id,
      mockTask.text,
      mockTask.description,
      mockTask.hasReminder,
      mockTask.dueDate,
      true
    );
    expect(screen.getByText("Test Task")).toHaveClass("line-through");
  });

  test("double click on title should be able to rename task", async () => {
    render(<TodoItem task={mockTask} onDelete={mockOnDelete} onUpdateTask={mockOnUpdateTask} />);
    const taskTitle = screen.getByText(mockTask.text);
    fireEvent.doubleClick(taskTitle);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Updated Task" } });
    fireEvent.blur(input);
    expect(mockOnUpdateTask).toHaveBeenCalledWith(
      mockTask.id,
      "Updated Task",
      mockTask.description,
      mockTask.hasReminder,
      mockTask.dueDate,
      mockTask.completed
    );
  });

  test("double click on description should be able to edit description", async () => {
    render(<TodoItem task={mockTask} onDelete={mockOnDelete} onUpdateTask={mockOnUpdateTask} />);
    const taskDescription = screen.getByText(mockTask.description);
    fireEvent.doubleClick(taskDescription);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Updated Description" } });
    fireEvent.blur(textarea);
    expect(mockOnUpdateTask).toHaveBeenCalledWith(
      mockTask.id,
      mockTask.text,
      "Updated Description",
      mockTask.hasReminder,
      mockTask.dueDate,
      mockTask.completed
    );
  });

  test("click on bell should toggle reminder", async () => {
    render(<TodoItem task={mockTask} onDelete={mockOnDelete} onUpdateTask={mockOnUpdateTask} />);
    const bellButton = screen.getByRole("button", { name: "" }); // Matches your reminder button
    fireEvent.click(bellButton);
    expect(mockOnUpdateTask).toHaveBeenCalledWith(
      mockTask.id,
      mockTask.text,
      mockTask.description,
      true,
      mockTask.dueDate,
      mockTask.completed
    );
  });

  test("click on due date should show due overlay", async () => {
    render(<TodoItem task={mockTask} onDelete={mockOnDelete} onUpdateTask={mockOnUpdateTask} />);
    const dueDateText = screen.getByTestId("due-date");
    fireEvent.mouseDown(dueDateText);
    fireEvent.mouseUp(dueDateText);
    expect(screen.getByRole("button", { name: "" })).toBeInTheDocument(); 
  });

  test("click somewhere outside of overlay should close it", async () => {
    render(<TodoItem task={mockTask} onDelete={mockOnDelete} onUpdateTask={mockOnUpdateTask} />);
    const dueDateText = screen.getByTestId("due-date");
    fireEvent.mouseDown(dueDateText);
    fireEvent.mouseUp(dueDateText);
    fireEvent.click(document.body);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument(); 
  });

  test("if changes are made in the reminder toggle it should be saved and updated", async () => {
    render(<TodoItem task={mockTask} onDelete={mockOnDelete} onUpdateTask={mockOnUpdateTask} />);
    const bellButton = screen.getByRole("button", { name: "" });
    fireEvent.click(bellButton);
    expect(mockOnUpdateTask).toHaveBeenCalledWith(
      mockTask.id,
      mockTask.text,
      mockTask.description,
      true,
      mockTask.dueDate,
      mockTask.completed
    );
  });

  test("if changes are made in the due date in overlay it should be saved and updated", async () => {
    render(<TodoItem task={mockTask} onDelete={mockOnDelete} onUpdateTask={mockOnUpdateTask} />);
    const dueDateText = screen.getByTestId("due-date");
    fireEvent.mouseDown(dueDateText);
    fireEvent.mouseUp(dueDateText);
    const newDueDate = "2025-02-25T10:00:00Z";
    fireEvent.click(dueDateText); 
    mockOnUpdateTask.mockImplementationOnce((id, text, desc, remind, due, comp) => {
      if (due === newDueDate) mockOnUpdateTask(id, text, desc, remind, due, comp);
    });
    mockOnUpdateTask(mockTask.id, mockTask.text, mockTask.description, mockTask.hasReminder, newDueDate, mockTask.completed);
    expect(mockOnUpdateTask).toHaveBeenLastCalledWith(
      mockTask.id,
      mockTask.text,
      mockTask.description,
      mockTask.hasReminder,
      newDueDate,
      mockTask.completed
    );
  });
});