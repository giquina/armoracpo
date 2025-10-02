import React from 'react';
import { Badge } from '../ui';
import './AppearanceSettings.css';

export interface AppearancePreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
}

interface AppearanceSettingsProps {
  preferences: AppearancePreferences;
  onChange: (preferences: AppearancePreferences) => void;
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ preferences, onChange }) => {
  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    onChange({ ...preferences, theme });
  };

  const handleFontSizeChange = (fontSize: 'small' | 'medium' | 'large') => {
    onChange({ ...preferences, fontSize });
  };

  return (
    <div className="appearance-settings">
      {/* Theme Selection */}
      <div className="appearance-settings__section">
        <div className="appearance-settings__section-header">
          <h4>Theme</h4>
          <Badge variant="warning" size="sm">Coming Soon</Badge>
        </div>
        <div className="appearance-settings__options">
          <button
            className={`appearance-settings__option ${preferences.theme === 'light' ? 'appearance-settings__option--active' : ''}`}
            onClick={() => handleThemeChange('light')}
            disabled
          >
            <span className="appearance-settings__option-icon">☀️</span>
            <span>Light</span>
          </button>
          <button
            className={`appearance-settings__option ${preferences.theme === 'dark' ? 'appearance-settings__option--active' : ''}`}
            onClick={() => handleThemeChange('dark')}
            disabled
          >
            <span className="appearance-settings__option-icon">🌙</span>
            <span>Dark</span>
          </button>
          <button
            className={`appearance-settings__option ${preferences.theme === 'auto' ? 'appearance-settings__option--active' : ''}`}
            onClick={() => handleThemeChange('auto')}
            disabled
          >
            <span className="appearance-settings__option-icon">⚙️</span>
            <span>Auto</span>
          </button>
        </div>
      </div>

      {/* Font Size */}
      <div className="appearance-settings__section">
        <h4>Font Size</h4>
        <div className="appearance-settings__options">
          <button
            className={`appearance-settings__option ${preferences.fontSize === 'small' ? 'appearance-settings__option--active' : ''}`}
            onClick={() => handleFontSizeChange('small')}
          >
            <span className="appearance-settings__option-text" style={{ fontSize: '14px' }}>A</span>
            <span>Small</span>
          </button>
          <button
            className={`appearance-settings__option ${preferences.fontSize === 'medium' ? 'appearance-settings__option--active' : ''}`}
            onClick={() => handleFontSizeChange('medium')}
          >
            <span className="appearance-settings__option-text" style={{ fontSize: '16px' }}>A</span>
            <span>Medium</span>
          </button>
          <button
            className={`appearance-settings__option ${preferences.fontSize === 'large' ? 'appearance-settings__option--active' : ''}`}
            onClick={() => handleFontSizeChange('large')}
          >
            <span className="appearance-settings__option-text" style={{ fontSize: '18px' }}>A</span>
            <span>Large</span>
          </button>
        </div>
      </div>

      {/* Language */}
      <div className="appearance-settings__section">
        <h4>Language</h4>
        <select
          className="appearance-settings__select"
          value={preferences.language}
          onChange={(e) => onChange({ ...preferences, language: e.target.value })}
        >
          <option value="en-GB">English (UK)</option>
          <option value="en-US">English (US)</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="es">Español</option>
        </select>
      </div>
    </div>
  );
};

export default AppearanceSettings;
