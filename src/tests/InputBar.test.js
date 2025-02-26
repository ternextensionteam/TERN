import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import InputBar from "../components/Inputbar/InputBar";

describe("InputBar Component", () => {
  test("should add a task only when title is provided", () => {
    const mockAddTask = jest.fn();
    render(<InputBar onAddTask={mockAddTask} />);
    
    const input = screen.getByPlaceholderText(/add a task/i);
    const addButton = screen.getByRole("button", { name: /add task/i });
    
    fireEvent.change(input, { target: { value: "New Task" } });
    fireEvent.click(addButton);
    
    expect(mockAddTask).toHaveBeenCalledWith(
      "New Task",
      expect.anything(), 
      "",
      null
    );
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
    
    expect(mockAddTask).toHaveBeenCalledWith(
      "Task Without Due",
      expect.anything(),
      "",
      null
    );
  });
});
