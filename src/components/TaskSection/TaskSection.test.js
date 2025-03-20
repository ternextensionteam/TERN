import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import TaskSection from "./TaskSection";
import { useTodoList } from "../../hooks/useTodoList/useTodoList";
import mockChrome from "../../__mocks__/chrome";

// Mock the custom hook
jest.mock("../../hooks/useTodoList/useTodoList");

describe("TaskSection Component", () => {
  let mockAddTask, mockDeleteTask, mockUpdateTask, mockToggleReminder;

  beforeEach(() => {
    // Reset mock functions
    mockAddTask = jest.fn();
    mockDeleteTask = jest.fn();
    mockUpdateTask = jest.fn();
    mockToggleReminder = jest.fn();

    useTodoList.mockReturnValue({
      tasks: [{ id: 1, text: "Test Task", completed: false }],
      addTask: mockAddTask,
      deleteTask: mockDeleteTask,
      updateTask: mockUpdateTask,
      toggleReminder: mockToggleReminder,
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

  test("loads deleted and completed tasks from storage", async () => {
    render(<TaskSection />);
  
    await waitFor(() => {
      expect(global.chrome.storage.local.get).toHaveBeenCalledWith(
        ["deletedTasks", "completedTasks"],
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

  test("deletes a task and adds it to deletedTasks", async () => {
    render(<TaskSection />);

    const deleteButton = await screen.findByTestId("delete-button");

    fireEvent.click(deleteButton);
    console.log("MOCKDELETE TASK CALLS:",mockDeleteTask.mock.calls); 


    await waitFor(() => {
        expect(chrome.storage.local.set).toHaveBeenCalledWith(
          expect.objectContaining({
            deletedTasks: expect.arrayContaining([
              expect.objectContaining({ id: 1, text: "Test Task", completed: false }),
            ]),
          }),
          expect.any(Function)
        );
      });
  });

  test("opens the recover page when clicking the recover button", async () => {
    render(<TaskSection />);

    const recoverPageButton = screen.getByTestId("recover-button");
    fireEvent.click(recoverPageButton);

    expect(await screen.findByTestId("recover-deleted-tasks-page")).toBeInTheDocument();
  });
  
});
