import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingScreen } from '../LoadingScreen';

describe('LoadingScreen Component', () => {
  it('renders loading screen', () => {
    const { container } = render(<LoadingScreen />);
    expect(container.querySelector('.loading-screen')).toBeInTheDocument();
    expect(container.querySelector('.loading-screen-logo')).toBeInTheDocument();
  });

  it('displays custom message when provided', () => {
    render(<LoadingScreen message="Loading assignments..." />);
    expect(screen.getByText('Loading assignments...')).toBeInTheDocument();
  });

  it('does not display message when not provided', () => {
    const { container } = render(<LoadingScreen />);
    expect(container.querySelector('.loading-screen-message')).not.toBeInTheDocument();
  });

  it('renders animated dots', () => {
    const { container } = render(<LoadingScreen />);
    const dots = container.querySelectorAll('.loading-screen-dots .dot');
    expect(dots).toHaveLength(3);
  });
});
