import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import TodoItem from "../components/TodoItem/TodoItem";


const mockTask = {
  id: 1,
  text: "Test Task",
  description: "Test Description",
  completed: false,
  reminder: { label: "Tomorrow", time: "2025-02-20T10:00:00Z" },
  dueDate: "2025-02-22T10:00:00Z",
};

const mockOnDelete = jest.fn();
const mockOnUpdateTask = jest.fn();

describe("TodoItem Component", () => {
  beforeEach(() => {
    mockOnDelete.mockClear();
    mockOnUpdateTask.mockClear();
  });

  test("hover on bell should show the selected reminder time", async () => {
    render(<TodoItem task={mockTask} onDelete={mockOnDelete} onUpdateTask={mockOnUpdateTask} />);
    const bellIcon = screen.getByRole("button", { name: /reminder/i });
    fireEvent.mouseOver(bellIcon);
    expect(bellIcon).toHaveAttribute("data-tooltip", "Reminder");
  });

  test("should be able to remove task by deleting", async () => {
    render(<TodoItem task={mockTask} onDelete={mockOnDelete} onUpdateTask={mockOnUpdateTask} />);
    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith(mockTask.id);
  });

  test("should be able to remove task by checking tasks", async () => {
    render(<TodoItem task={mockTask} onDelete={mockOnDelete} onUpdateTask={mockOnUpdateTask} />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(mockOnUpdateTask).toHaveBeenCalledWith(
      mockTask.id,
      mockTask.text,
      mockTask.description,
      mockTask.reminder,
      mockTask.dueDate,
      true
    );
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
      mockTask.reminder,
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
      mockTask.reminder,
      mockTask.dueDate,
      mockTask.completed
    );
  });

  test("click on bell should show reminder overlay", async () => {
    render(<TodoItem task={mockTask} onDelete={mockOnDelete} onUpdateTask={mockOnUpdateTask} />);
    const bellButton = screen.getByRole("button", { name: /reminder/i });
    fireEvent.click(bellButton);
    expect(screen.getByText(/set reminder/i)).toBeInTheDocument();
  });

  test("click on due date should show due overlay", async () => {
    render(<TodoItem task={mockTask} onDelete={mockOnDelete} onUpdateTask={mockOnUpdateTask} />);
    const dueDateText = screen.getByTestId("due-date");
    fireEvent.click(dueDateText);
    expect(screen.getByText(/set due date/i)).toBeInTheDocument();
  });

  test("click somewhere outside of overlay should close it", async () => {
    render(<TodoItem task={mockTask} onDelete={mockOnDelete} onUpdateTask={mockOnUpdateTask} />);
    const bellButton = screen.getByRole("button", { name: /reminder/i });
    fireEvent.click(bellButton);
    fireEvent.click(document.body);
    expect(screen.queryByText(/set reminder/i)).not.toBeInTheDocument();
  });

  test("if changes are made in the reminder time in overlay it should be saved and updated", async () => {
    render(<TodoItem task={mockTask} onDelete={mockOnDelete} onUpdateTask={mockOnUpdateTask} />);
    const bellButton = screen.getByRole("button", { name: /reminder/i });
    fireEvent.click(bellButton);
    const presetOption = screen.getByText(/tomorrow/i);
    fireEvent.click(presetOption);
    expect(mockOnUpdateTask).toHaveBeenCalledWith(
      mockTask.id,
      mockTask.text,
      mockTask.description,
      { label: "Tomorrow", time: "2025-02-20T10:00:00Z" },
      mockTask.dueDate,
      false
    );
  });

  test("if changes are made in the due date time in overlay it should be saved and updated", async () => {
    render(<TodoItem task={mockTask} onDelete={mockOnDelete} onUpdateTask={mockOnUpdateTask} />);
    const dueDateText = screen.getByTestId("due-date");
    fireEvent.click(dueDateText);
    const newDueDate = "2025-02-25T10:00";
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: newDueDate } });
    fireEvent.blur(screen.getByLabelText(/due date/i));
    expect(mockOnUpdateTask).toHaveBeenCalledWith(
      mockTask.id,
      mockTask.text,
      mockTask.description,
      mockTask.reminder,
      "2025-02-25T10:00:00Z",
      false
    );
  });
});
