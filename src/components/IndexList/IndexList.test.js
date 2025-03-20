import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import IndexList from "./IndexList";
import "@testing-library/jest-dom";

describe("IndexList Component", () => {
  let mockOnDelete;
  let items;
  let activeIndexSection;

  beforeEach(() => {
    mockOnDelete = jest.fn();
    activeIndexSection = "allowedSites";
    items = ["example.com", "testsite.com"];
  });

  test("renders the list of items", () => {
    render(<IndexList items={items} onDelete={mockOnDelete} activeIndexSection={activeIndexSection} />);

    expect(screen.getByText("example.com")).toBeInTheDocument();
    expect(screen.getByText("testsite.com")).toBeInTheDocument();
  });

  test("calls onDelete when the delete button is clicked", () => {
    render(<IndexList items={items} onDelete={mockOnDelete} activeIndexSection={activeIndexSection} />);

    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });

    fireEvent.click(deleteButtons[0]); 

    expect(mockOnDelete).toHaveBeenCalledWith(activeIndexSection, "example.com");
  });

  test("handles an empty list without errors", () => {
    render(<IndexList items={[]} onDelete={mockOnDelete} activeIndexSection={activeIndexSection} />);

    expect(screen.queryByText("example.com")).not.toBeInTheDocument();
    expect(screen.queryByText("testsite.com")).not.toBeInTheDocument();
  });
});
