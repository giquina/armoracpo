import React from 'react';
import { render, screen } from '@testing-library/react';
import { Logo } from '../Logo';

describe('Logo Component', () => {
  it('renders full logo variant by default', () => {
    const { container } = render(<Logo />);
    expect(container.querySelector('.armora-logo-full')).toBeInTheDocument();
    expect(screen.getByText('ARMORA')).toBeInTheDocument();
  });

  it('renders icon variant', () => {
    const { container } = render(<Logo variant="icon" />);
    expect(container.querySelector('.armora-logo-icon')).toBeInTheDocument();
    expect(screen.getByLabelText('Armora Shield')).toBeInTheDocument();
  });

  it('renders wordmark variant', () => {
    const { container } = render(<Logo variant="wordmark" />);
    expect(container.querySelector('.armora-logo-wordmark')).toBeInTheDocument();
  });

  it('applies custom size', () => {
    const { container } = render(<Logo size={60} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '60');
    expect(svg).toHaveAttribute('height', '60');
  });

  it('applies custom className', () => {
    const { container } = render(<Logo className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
