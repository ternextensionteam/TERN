import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import TaskSection from "./TaskSection";
import { useTodoList } from "../../hooks/useTodoList/useTodoList";
import mockChrome from "../../__mocks__/chrome";

// Mock the custom hook
jest.mock("../../hooks/useTodoList/useTodoList");

jest.mock("../../utils/Logger");

describe("TaskSection Component", () => {
  let mockAddTask, mockDeleteTask, mockUpdateTask, mockToggleReminder, mockMoveCompletedTasks;

  beforeEach(() => {
    // Reset mock functions
    mockAddTask = jest.fn();
    mockDeleteTask = jest.fn();
    mockUpdateTask = jest.fn();
    mockToggleReminder = jest.fn();
    mockMoveCompletedTasks = jest.fn();

    useTodoList.mockReturnValue({
      tasks: [{ id: 1, text: "Test Task", completed: false }],
      addTask: mockAddTask,
      deleteTask: mockDeleteTask,
      updateTask: mockUpdateTask,
      toggleReminder: mockToggleReminder,
      moveCompletedTasks: mockMoveCompletedTasks,
    });

    // Mock storage
    mockChrome.storage.local.get.mockImplementation((keys, callback) => {
        const result = {};
        if (keys.includes("deletedTasks")) {
          result.deletedTasks = [{ id: 2, text: "Deleted Task", completed: false }];
        }
        if (keys.includes("completedTasks")) {
          result.completedTasks = [{ id: 3, text: "Completed Task", completed: true }];
        }
        callback(result);
    });

    mockChrome.storage.local.set.mockImplementation((data, callback) => {
      callback();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders TaskSection component", () => {
    render(<TaskSection />);
    expect(screen.getByTestId("task-section")).toBeInTheDocument();
  });

  test("loads selectedText from storage", async () => {
    render(<TaskSection />);
  
    await waitFor(() => {
      expect(global.chrome.storage.local.get).toHaveBeenCalledWith(
        ["selectedText"],
        expect.any(Function)
      );
    });
  });

  test("adds a new task", async () => {
    render(<TaskSection />);

    const input = screen.getByPlaceholderText("Add a Task");
    fireEvent.change(input, { target: { value: "New Task" } });

    fireEvent.submit(input);
    expect(mockAddTask).toHaveBeenCalledWith("New Task", false, "", null);
  });

  test("deletes a task", async () => {
    render(<TaskSection />);
  
    const deleteButton = await screen.findByTestId("delete-button");
    fireEvent.click(deleteButton);
  
    // Wait for the setTimeout to complete
    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith(1);
    }, { timeout: 1000 }); // Give it enough time
  });

  test("opens the recover page when clicking the recover button", async () => {
    render(<TaskSection />);

    const recoverPageButton = screen.getByTestId("recover-button");
    fireEvent.click(recoverPageButton);

    expect(await screen.findByTestId("recover-deleted-tasks-page")).toBeInTheDocument();
  });
  
});
