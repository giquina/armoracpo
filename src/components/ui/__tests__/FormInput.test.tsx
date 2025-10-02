import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormInput } from '../FormInput';

describe('FormInput', () => {
  it('renders input with label', () => {
    render(<FormInput label="Test Label" />);
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<FormInput placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(<FormInput label="Required Field" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<FormInput label="Field" error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('displays helper text when no error', () => {
    render(<FormInput label="Field" helperText="Helper text" />);
    expect(screen.getByText('Helper text')).toBeInTheDocument();
  });

  it('hides helper text when error is present', () => {
    render(<FormInput label="Field" error="Error" helperText="Helper" />);
    expect(screen.queryByText('Helper')).not.toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('handles onChange events', () => {
    const handleChange = jest.fn();
    render(<FormInput label="Field" onChange={handleChange} />);
    const input = screen.getByLabelText('Field');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('applies error styling when error is present', () => {
    render(<FormInput label="Field" error="Error message" />);
    const input = screen.getByLabelText('Field');
    expect(input).toHaveClass('armora-form-input--error');
  });

  it('has correct aria attributes when error', () => {
    render(<FormInput label="Field" error="Error message" />);
    const input = screen.getByLabelText('Field');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('supports different input types', () => {
    const { rerender } = render(<FormInput type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<FormInput type="password" />);
    const passwordInput = document.querySelector('input[type="password"]');
    expect(passwordInput).toBeInTheDocument();
  });
});
