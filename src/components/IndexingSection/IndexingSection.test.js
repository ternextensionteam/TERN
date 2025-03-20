import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import IndexingSection from "./IndexingSection";
import useIndexMatching from "../../hooks/useIndexMatching/useIndexMatching";
import "@testing-library/jest-dom";

jest.mock("../../hooks/useIndexMatching/useIndexMatching");

describe("IndexingSection Component", () => {
    beforeEach(() => {
        let rulesState = {
            allowedSites: ["example.com"], 
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
        
        expect(screen.getByText("Sites")).toBeInTheDocument();
        expect(screen.getByText("URLs")).toBeInTheDocument();
        expect(screen.getByText("String Matches")).toBeInTheDocument();
        expect(screen.getByText("RegEx")).toBeInTheDocument();

        expect(screen.getByText("Indexed Sites:")).toBeInTheDocument();
    });

    test("switches tabs correctly", () => {
        render(<IndexingSection />);

        fireEvent.click(screen.getByText("URLs"));

        expect(screen.getByText("Indexed URLs:")).toBeInTheDocument();
    });

    test("calls addRule function when a new rule is added", () => {
        const { addRule } = useIndexMatching();
        render(<IndexingSection />);

        const inputBox = screen.getByRole("textbox");
        const addButton = screen.getByRole("button", { name: /add/i });

        fireEvent.change(inputBox, { target: { value: "testsite.com" } });
        fireEvent.click(addButton);

        expect(addRule).toHaveBeenCalledWith("allowedSites", "testsite.com");
    });

    test("calls removeRule function when a rule is deleted", () => {
        const { removeRule } = useIndexMatching();
        render(<IndexingSection />);
    
        const deleteButton = screen.getByLabelText("delete");
        fireEvent.click(deleteButton);
        expect(removeRule).toHaveBeenCalled();
    });

    test("opens the recover deleted rules page", async () => {
        render(<IndexingSection />);
        const recoverButton = screen.getByTestId("recover-button");
        fireEvent.click(recoverButton);
        expect(await screen.findByText("Deleted Sites")).toBeInTheDocument();
    });

    test("opens the recover deleted rules page", async () => {
        render(<IndexingSection />);

        const recoverButton = screen.getByTestId("recover-button");
        fireEvent.click(recoverButton);
        expect(await screen.findByText("Deleted Sites")).toBeInTheDocument();
    });

    test("recovers a deleted rule and displays it again", async () => {
        render(<IndexingSection />);
      
        const recoverButton = screen.getByTestId("recover-button");
        fireEvent.click(recoverButton);
      
        const recoverRuleButton = await screen.findByRole("button", { name: /recover/i });
        fireEvent.click(recoverRuleButton);
      
        expect(await screen.findByText("deleted-example.com")).toBeInTheDocument();
    });
      
});