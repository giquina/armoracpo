import React from 'react';
import { Logo } from './Logo';
import './LoadingScreen.css';

interface LoadingScreenProps {
  message?: string;
}

/**
 * LoadingScreen Component
 *
 * Professional loading screen with animated Armora logo.
 * Used during app initialization, authentication, and major data loading operations.
 *
 * @param message - Optional loading message to display below the logo
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div className="loading-screen">
      <div className="loading-screen-content">
        {/* Animated logo with shimmer effect */}
        <div className="loading-screen-logo">
          <Logo variant="full" size={80} />
        </div>

        {/* Loading message */}
        {message && (
          <p className="loading-screen-message">{message}</p>
        )}

        {/* Animated dots */}
        <div className="loading-screen-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
