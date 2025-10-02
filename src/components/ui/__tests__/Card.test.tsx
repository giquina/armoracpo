import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card } from '../Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('applies default variant', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild).toHaveClass('armora-card--default');
  });

  it('applies correct variant class', () => {
    const { container } = render(<Card variant="navy">Navy Card</Card>);
    expect(container.firstChild).toHaveClass('armora-card--navy');
  });

  it('handles click when onClick is provided', () => {
    const handleClick = jest.fn();
    render(<Card onClick={handleClick}>Clickable Card</Card>);
    fireEvent.click(screen.getByText('Clickable Card'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies interactive class when onClick is provided', () => {
    const { container } = render(<Card onClick={() => {}}>Interactive</Card>);
    expect(container.firstChild).toHaveClass('armora-card--interactive');
  });

  it('applies interactive class when variant is interactive', () => {
    const { container } = render(<Card variant="interactive">Interactive</Card>);
    expect(container.firstChild).toHaveClass('armora-card--interactive');
  });

  it('has button role when clickable', () => {
    render(<Card onClick={() => {}}>Clickable</Card>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles keyboard events when clickable', () => {
    const handleClick = jest.fn();
    render(<Card onClick={handleClick}>Keyboard Card</Card>);
    const card = screen.getByRole('button');

    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(card, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
