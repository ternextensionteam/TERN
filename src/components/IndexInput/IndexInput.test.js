import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import IndexInput from './IndexInput';

describe('IndexInput Component', () => {
  let addMock;
  let activeIndexSection;

  beforeEach(() => {
    addMock = jest.fn();
    activeIndexSection = 'allowedSites';
  });

  test('renders input field and add button', () => {
    render(<IndexInput add={addMock} activeIndexSection={activeIndexSection} />);
    
    expect(screen.getByPlaceholderText('Enter link here')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  test('updates input value when typing', () => {
    render(<IndexInput add={addMock} activeIndexSection={activeIndexSection} />);
    
    const input = screen.getByPlaceholderText('Enter link here');
    fireEvent.change(input, { target: { value: 'testsite.com' } });

    expect(input.value).toBe('testsite.com');
  });

  test('calls add function and clears input when add button is clicked', () => {
    render(<IndexInput add={addMock} activeIndexSection={activeIndexSection} />);
    
    const input = screen.getByPlaceholderText('Enter link here');
    const addButton = screen.getByRole('button', { name: /add/i });

    fireEvent.change(input, { target: { value: 'testsite.com' } });
    fireEvent.click(addButton);

    expect(addMock).toHaveBeenCalledWith('allowedSites', 'testsite.com');
    expect(input.value).toBe('');
  });

  test('calls add function and clears input when Enter is pressed', () => {
    render(<IndexInput add={addMock} activeIndexSection={activeIndexSection} />);
    
    const input = screen.getByPlaceholderText('Enter link here');

    fireEvent.change(input, { target: { value: 'testsite.com' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(addMock).toHaveBeenCalledWith('allowedSites', 'testsite.com');
    expect(input.value).toBe('');
  });

  test('does not call add function if input is empty', () => {
    render(<IndexInput add={addMock} activeIndexSection={activeIndexSection} />);
    
    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);

    expect(addMock).not.toHaveBeenCalled();
  });

  test("handles special characters correctly", () => {
    render(<IndexInput add={addMock} activeIndexSection={activeIndexSection} />);

    const input = screen.getByPlaceholderText("Enter link here");
    const button = screen.getByText("Add");

    fireEvent.change(input, { target: { value: "https://test-site.com/?query=123" } });
    fireEvent.click(button);

    expect(addMock).toHaveBeenCalledWith("allowedSites", "https://test-site.com/?query=123");
  });

  test("does not allow adding when only whitespace is entered", () => {
    render(<IndexInput add={addMock} activeIndexSection={activeIndexSection} />);

    const input = screen.getByPlaceholderText("Enter link here");
    const button = screen.getByText("Add");

    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.click(button);

    expect(addMock).not.toHaveBeenCalled();
  });
});
