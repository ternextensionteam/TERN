import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RecoverDeletedIndex from "./RecoverDeletedIndex";

describe("RecoverDeletedIndex Component", () => {
  let mockOnRecover, mockOnBack, mockOnGoToIndexing;

  beforeEach(() => {
    mockOnRecover = jest.fn();
    mockOnBack = jest.fn();
    mockOnGoToIndexing = jest.fn();
  });

  test("renders without crashing", () => {
    render(
      <RecoverDeletedIndex
        deletedItems={{ allowedSites: ["example.com"] }}
        onRecover={mockOnRecover}
        onBack={mockOnBack}
        onGoToIndexing={mockOnGoToIndexing}
        activeItems={{ allowedSites: [] }}
      />
    );

    expect(screen.getByText("Deleted Sites")).toBeInTheDocument();
    expect(screen.getByText("example.com")).toBeInTheDocument();
  });

  test("switches between different sections", () => {
    render(
      <RecoverDeletedIndex
        deletedItems={{
          allowedSites: ["example.com"],
          allowedURLs: ["test.com"],
        }}
        onRecover={mockOnRecover}
        onBack={mockOnBack}
        onGoToIndexing={mockOnGoToIndexing}
        activeItems={{ allowedSites: [], allowedURLs: [] }}
      />
    );

    // Click on the "URLs" tab
    fireEvent.click(screen.getByText("URLs"));

    // Check if the section title updates correctly
    expect(screen.getByText("Deleted URLs")).toBeInTheDocument();
    expect(screen.getByText("test.com")).toBeInTheDocument();
  });

  test("calls onRecover when recover button is clicked", () => {
    render(
      <RecoverDeletedIndex
        deletedItems={{ allowedSites: ["example.com"] }}
        onRecover={mockOnRecover}
        onBack={mockOnBack}
        onGoToIndexing={mockOnGoToIndexing}
        activeItems={{ allowedSites: [] }}
      />
    );

    // Click the recover button
    fireEvent.click(screen.getByRole("button", { name: "recover" }));

    expect(mockOnRecover).toHaveBeenCalledWith("allowedSites", "example.com");
  });

  test("does not show items that are already in activeItems", () => {
    render(
      <RecoverDeletedIndex
        deletedItems={{ allowedSites: ["example.com", "test.com"] }}
        onRecover={mockOnRecover}
        onBack={mockOnBack}
        onGoToIndexing={mockOnGoToIndexing}
        activeItems={{ allowedSites: ["example.com"] }} // "example.com" should not appear
      />
    );

    expect(screen.queryByText("example.com")).not.toBeInTheDocument();
    expect(screen.getByText("test.com")).toBeInTheDocument();
  });

  test("displays empty message when there are no deleted items", () => {
    render(
      <RecoverDeletedIndex
        deletedItems={{ allowedSites: [] }}
        onRecover={mockOnRecover}
        onBack={mockOnBack}
        onGoToIndexing={mockOnGoToIndexing}
        activeItems={{ allowedSites: [] }}
      />
    );

    expect(
      screen.getByText("No deleted Sites to recover.")
    ).toBeInTheDocument();
  });

  test("calls onBack when back button is clicked", () => {
    render(
      <RecoverDeletedIndex
        deletedItems={{ allowedSites: ["example.com"] }}
        onRecover={mockOnRecover}
        onBack={mockOnBack}
        onGoToIndexing={mockOnGoToIndexing}
        activeItems={{ allowedSites: [] }}
      />
    );

    const backButton = screen.getByRole("button", { name: /back/i });
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  test("does not show recover button when there are no deleted items", () => {
    render(
      <RecoverDeletedIndex
        deletedItems={{ allowedSites: [] }}
        activeItems={{ allowedSites: [] }}
        onRecover={jest.fn()}
        onBack={jest.fn()}
        onGoToIndexing={jest.fn()}
      />
    );
  
    expect(screen.queryByRole("button", { name: /recover/i })).not.toBeInTheDocument();
  });
  
});
