import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import InputBar from "./InputBar";
import "@testing-library/jest-dom";

describe("InputBar Component", () => {
  let mockOnAddTask;

  beforeEach(() => {
    mockOnAddTask = jest.fn();
    render(<InputBar onAddTask={mockOnAddTask} />);
  });

  test("renders input fields and buttons", async () => {
    const input = await screen.findByPlaceholderText("Add a Task");
    expect(screen.getByPlaceholderText("Add a description (optional)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add Task/i })).toBeInTheDocument();
  });

  test("updates input value when typing", () => {
    const input = screen.getByPlaceholderText("Add a Task");
    fireEvent.change(input, { target: { value: "New Task" } });

    expect(input.value).toBe("New Task");
  });

  test("calls onAddTask and clears input when form is submitted", () => {
    const input = screen.getByPlaceholderText("Add a Task");
    const textarea = screen.getByPlaceholderText("Add a description (optional)");
    const addButton = screen.getByRole("button", { name: /Add Task/i });

    fireEvent.change(input, { target: { value: "Test Task" } });
    fireEvent.change(textarea, { target: { value: "Test Description" } });
    fireEvent.click(addButton);

    expect(mockOnAddTask).toHaveBeenCalledWith("Test Task", false, "Test Description", null);
    expect(input.value).toBe(""); 
    expect(textarea.value).toBe("");
  });

  test("does not call onAddTask when input is empty", () => {
    const addButton = screen.getByRole("button", { name: /Add Task/i });

    fireEvent.click(addButton);
    expect(mockOnAddTask).not.toHaveBeenCalled();
  });

  test("toggles reminder state when bell icon is clicked", () => {
    const bellButton = screen.getByRole("button", { name: /Reminder off/i });
    fireEvent.click(bellButton);

    expect(screen.getByRole("button", { name: /Reminder on/i })).toBeInTheDocument();
  });

  test("opens and closes due date overlay when due date button is clicked", async () => {

    const dueDateButton = screen.getByTestId("due-date-button");
    fireEvent.click(dueDateButton);
  
    await waitFor(() => {
        expect(screen.queryByText(/Set Due Date/i)).not.toBeInTheDocument();
      });
  
  });

  test("does not add a task with only whitespace", () => {
    const input = screen.getByPlaceholderText("Add a Task");
    const addButton = screen.getByRole("button", { name: /Add Task/i });

    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.click(addButton);

    expect(mockOnAddTask).not.toHaveBeenCalled();
  });

});
