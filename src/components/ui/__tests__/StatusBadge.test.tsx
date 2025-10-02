import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders operational status correctly', () => {
    render(<StatusBadge status="operational" />);
    expect(screen.getByText('Operational')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('armora-status-badge--operational');
  });

  it('renders busy status correctly', () => {
    render(<StatusBadge status="busy" />);
    expect(screen.getByText('On Assignment')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('armora-status-badge--busy');
  });

  it('renders offline status correctly', () => {
    render(<StatusBadge status="offline" />);
    expect(screen.getByText('Stand Down')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('armora-status-badge--offline');
  });

  it('applies correct size class', () => {
    const { container } = render(<StatusBadge status="operational" size="lg" />);
    expect(container.firstChild).toHaveClass('armora-status-badge--lg');
  });

  it('shows icon by default', () => {
    const { container } = render(<StatusBadge status="operational" />);
    expect(container.querySelector('.armora-status-badge__icon')).toBeInTheDocument();
  });

  it('hides icon when showIcon is false', () => {
    const { container } = render(<StatusBadge status="operational" showIcon={false} />);
    expect(container.querySelector('.armora-status-badge__icon')).not.toBeInTheDocument();
  });

  it('has correct aria-label', () => {
    render(<StatusBadge status="operational" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Status: Operational');
  });
});
