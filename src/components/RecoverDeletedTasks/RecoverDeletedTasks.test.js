import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecoverDeletedTasks from "./RecoverDeletedTasks";
import "@testing-library/jest-dom";

describe("RecoverDeletedTasks Component", () => {
  let mockOnRecoverDeleted, mockOnRecoverCompleted, mockOnBack;

  beforeEach(() => {
    mockOnRecoverDeleted = jest.fn();
    mockOnRecoverCompleted = jest.fn();
    mockOnBack = jest.fn();
  });

  test("renders the component correctly", () => {
    render(
      <RecoverDeletedTasks
        deletedTasks={[]}
        completedTasks={[]}
        onRecoverDeleted={mockOnRecoverDeleted}
        onRecoverCompleted={mockOnRecoverCompleted}
        onBack={mockOnBack}
      />
    );
    expect(screen.getByRole("heading", { name: /Completed Tasks/i })).toBeInTheDocument();
    expect(screen.getByText("Deleted Tasks")).toBeInTheDocument();
  });

  test("displays completed tasks correctly", () => {
    render(
      <RecoverDeletedTasks
        deletedTasks={[]}
        completedTasks={[{ text: "Completed Task 1", completed: true }]}
        onRecoverDeleted={mockOnRecoverDeleted}
        onRecoverCompleted={mockOnRecoverCompleted}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText("Completed Task 1")).toBeInTheDocument();
  });

  test("displays deleted tasks correctly", () => {
    render(
      <RecoverDeletedTasks
        deletedTasks={[{ text: "Deleted Task 1", completed: false }]}
        completedTasks={[]}
        onRecoverDeleted={mockOnRecoverDeleted}
        onRecoverCompleted={mockOnRecoverCompleted}
        onBack={mockOnBack}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Deleted Tasks/i }));
    expect(screen.getByText("Deleted Task 1")).toBeInTheDocument();
  });

  test("switches between tabs correctly", () => {
    render(
      <RecoverDeletedTasks
        deletedTasks={[{ text: "Deleted Task 1" }]}
        completedTasks={[{ text: "Completed Task 1", completed: true }]}
        onRecoverDeleted={mockOnRecoverDeleted}
        onRecoverCompleted={mockOnRecoverCompleted}
        onBack={mockOnBack}
      />
    );

    // Default tab: "Completed Tasks"
    expect(screen.getByText("Completed Task 1")).toBeInTheDocument();
    expect(screen.queryByText("Deleted Task 1")).not.toBeInTheDocument();

    // Switch to "Deleted Tasks"
    fireEvent.click(screen.getByRole("button", { name: /Deleted Tasks/i }));
    expect(screen.getByText("Deleted Task 1")).toBeInTheDocument();
    expect(screen.queryByText("Completed Task 1")).not.toBeInTheDocument();
  });

  test("calls onRecoverCompleted when recovering a completed task", () => {
    render(
      <RecoverDeletedTasks
        deletedTasks={[]}
        completedTasks={[{ text: "Completed Task 1", completed: true }]}
        onRecoverDeleted={mockOnRecoverDeleted}
        onRecoverCompleted={mockOnRecoverCompleted}
        onBack={mockOnBack}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /recover/i }));
    expect(mockOnRecoverCompleted).toHaveBeenCalledWith(0);
  });

  test("calls onRecoverDeleted when recovering a deleted task", () => {
    render(
      <RecoverDeletedTasks
        deletedTasks={[{ text: "Deleted Task 1", completed: false }]}
        completedTasks={[]}
        onRecoverDeleted={mockOnRecoverDeleted}
        onRecoverCompleted={mockOnRecoverCompleted}
        onBack={mockOnBack}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Deleted Tasks/i }));
    fireEvent.click(screen.getByRole("button", { name: /recover/i }));
    expect(mockOnRecoverDeleted).toHaveBeenCalledWith(0);
  });

  test("calls onBack when back button is clicked", () => {
    render(
      <RecoverDeletedTasks
        deletedTasks={[]}
        completedTasks={[]}
        onRecoverDeleted={mockOnRecoverDeleted}
        onRecoverCompleted={mockOnRecoverCompleted}
        onBack={mockOnBack}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Back/i }));
    expect(mockOnBack).toHaveBeenCalled();
  });

  test("does not display recover button if no tasks exist", () => {
    render(
      <RecoverDeletedTasks
        deletedTasks={[]}
        completedTasks={[]}
        onRecoverDeleted={mockOnRecoverDeleted}
        onRecoverCompleted={mockOnRecoverCompleted}
        onBack={mockOnBack}
      />
    );

    expect(screen.queryByRole("button", { name: /recover/i })).not.toBeInTheDocument();
  });

});
