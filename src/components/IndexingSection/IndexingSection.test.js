import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import IndexingSection from "./IndexingSection";
import useIndexMatching from "../../hooks/useIndexMatching/useIndexMatching";
import "@testing-library/jest-dom";

jest.mock("../../hooks/useIndexMatching/useIndexMatching");

describe("IndexingSection Component", () => {
    beforeEach(() => {
        let rulesState = {
            allowedSites: ["example.com"], // Initial state
        };
        useIndexMatching.mockReturnValue({
          rules: rulesState,
          deletedRules: {
            allowedSites: ["deleted-example.com"],
          },
          addRule: jest.fn((rule, section) => {
            console.log("addRule called with:", rule, section);
            if (!rulesState[section]) rulesState[section] = [];
            rulesState[section] = [...rulesState[section], rule];
          }),
          removeRule: jest.fn(),
          recoverRule: jest.fn(),
          checkCurrentUrl: jest.fn(),
        });
      });      
    

    test("renders IndexingSection correctly", () => {
        render(<IndexingSection />);
        
        // check navigation tabs exist
        expect(screen.getByText("Sites")).toBeInTheDocument();
        expect(screen.getByText("URLs")).toBeInTheDocument();
        expect(screen.getByText("String Matches")).toBeInTheDocument();
        expect(screen.getByText("RegEx")).toBeInTheDocument();

        // check that default tab is "Sites"
        expect(screen.getByText("Indexed Sites:")).toBeInTheDocument();
    });

    test("switches tabs correctly", () => {
        render(<IndexingSection />);

        // click the "URLs" tab
        fireEvent.click(screen.getByText("URLs"));

        // check that section changes
        expect(screen.getByText("Indexed URLs:")).toBeInTheDocument();
    });

    test("calls addRule function when a new rule is added", () => {
        const { addRule } = useIndexMatching();
        render(<IndexingSection />);

        // find input and add button
        const inputBox = screen.getByRole("textbox");
        const addButton = screen.getByRole("button", { name: /add/i });

        // user input
        fireEvent.change(inputBox, { target: { value: "testsite.com" } });
        fireEvent.click(addButton);

        // expecting addRule to have been called
        expect(addRule).toHaveBeenCalledWith("allowedSites", "testsite.com");
    });

    test("calls removeRule function when a rule is deleted", () => {
        const { removeRule } = useIndexMatching();
        render(<IndexingSection />);
    
        // find delete button using aria-label
        const deleteButton = screen.getByLabelText("delete");
        
        // Click the delete button
        fireEvent.click(deleteButton);
    
        // snsure removeRule was called
        expect(removeRule).toHaveBeenCalled();
    });

    test("opens the recover deleted rules page", async () => {
        render(<IndexingSection />);

        // find/click the recover button
        const recoverButton = screen.getByTestId("recover-button");
        fireEvent.click(recoverButton);

        // check whether recovery page content appears
        expect(await screen.findByText("Deleted Sites")).toBeInTheDocument();
    });

    test("opens the recover deleted rules page", async () => {
        render(<IndexingSection />);

        // find/click the recover button
        const recoverButton = screen.getByTestId("recover-button");
        fireEvent.click(recoverButton);

        // check whether recovery page content appears
        expect(await screen.findByText("Deleted Sites")).toBeInTheDocument();
    });

    test("recovers a deleted rule and displays it again", async () => {
        render(<IndexingSection />);
      
        // click  recover button
        const recoverButton = screen.getByTestId("recover-button");
        fireEvent.click(recoverButton);
      
        // click recover button inside RecoverDeletedIndex
        const recoverRuleButton = await screen.findByRole("button", { name: /recover/i });
        fireEvent.click(recoverRuleButton);
      
        // rnsure the recovered rule is back in the list
        expect(await screen.findByText("deleted-example.com")).toBeInTheDocument();
    });
    
    // test("calls addRule and displays the new rule in the list", async () => {
    //     const mockAddRule = jest.fn();
    //     useIndexMatching.mockReturnValue({
    //       rules: {
    //         allowedSites: ["example.com"],
    //       },
    //       addRule: mockAddRule,
    //     });
      
    //     // render(<IndexingSection />);
    //     const { rerender } = render(<IndexingSection />);
    //     const inputBox = screen.getByRole("textbox");
    //     const addButton = screen.getByRole("button", { name: /add/i });
      
    //     fireEvent.change(inputBox, { target: { value: "testsite.com" } });
    //     fireEvent.click(addButton);
      
    //     // ensure addRule is called
    //     expect(mockAddRule).toHaveBeenCalledWith("allowedSites", "testsite.com");
      
    //     // simulate re-render with updated mock
    //     useIndexMatching.mockReturnValue({
    //       rules: {
    //         allowedSites: ["example.com", "testsite.com"],
    //       },
    //       addRule: mockAddRule,
    //     });
      
    //     rerender(<IndexingSection />); 
    //     await waitFor(() => {
    //       expect(screen.getByText("testsite.com")).toBeInTheDocument();
    //     });
    //   });
      
});