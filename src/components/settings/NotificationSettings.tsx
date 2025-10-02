import React, { useState } from 'react';
import './NotificationSettings.css';

export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

interface NotificationSettingsProps {
  preferences: NotificationPreferences;
  onChange: (preferences: NotificationPreferences) => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ preferences, onChange }) => {
  const [localPrefs, setLocalPrefs] = useState(preferences);

  const handleToggle = (key: keyof NotificationPreferences) => {
    const newPrefs = { ...localPrefs, [key]: !localPrefs[key] };
    setLocalPrefs(newPrefs);
    onChange(newPrefs);
  };

  const handleTimeChange = (key: 'quietHoursStart' | 'quietHoursEnd', value: string) => {
    const newPrefs = { ...localPrefs, [key]: value };
    setLocalPrefs(newPrefs);
    onChange(newPrefs);
  };

  const ToggleSwitch: React.FC<{ enabled: boolean; onChange: () => void }> = ({ enabled, onChange }) => (
    <button
      className={`toggle-switch ${enabled ? 'toggle-switch--on' : 'toggle-switch--off'}`}
      onClick={onChange}
      role="switch"
      aria-checked={enabled}
    >
      <span className="toggle-switch__slider" />
    </button>
  );

  return (
    <div className="notification-settings">
      <div className="notification-settings__item">
        <div className="notification-settings__item-content">
          <h4>Push Notifications</h4>
          <p>Get notified about new assignments</p>
        </div>
        <ToggleSwitch enabled={localPrefs.push} onChange={() => handleToggle('push')} />
      </div>

      <div className="notification-settings__item">
        <div className="notification-settings__item-content">
          <h4>Email Notifications</h4>
          <p>Receive email updates</p>
        </div>
        <ToggleSwitch enabled={localPrefs.email} onChange={() => handleToggle('email')} />
      </div>

      <div className="notification-settings__item">
        <div className="notification-settings__item-content">
          <h4>SMS Alerts</h4>
          <p>Text messages for urgent updates</p>
        </div>
        <ToggleSwitch enabled={localPrefs.sms} onChange={() => handleToggle('sms')} />
      </div>

      <div className="notification-settings__divider" />

      <div className="notification-settings__item">
        <div className="notification-settings__item-content">
          <h4>Quiet Hours</h4>
          <p>Mute non-urgent notifications</p>
        </div>
        <ToggleSwitch enabled={localPrefs.quietHoursEnabled} onChange={() => handleToggle('quietHoursEnabled')} />
      </div>

      {localPrefs.quietHoursEnabled && (
        <div className="notification-settings__quiet-hours">
          <div className="notification-settings__time-input">
            <label>Start Time</label>
            <input
              type="time"
              value={localPrefs.quietHoursStart}
              onChange={(e) => handleTimeChange('quietHoursStart', e.target.value)}
            />
          </div>
          <div className="notification-settings__time-input">
            <label>End Time</label>
            <input
              type="time"
              value={localPrefs.quietHoursEnd}
              onChange={(e) => handleTimeChange('quietHoursEnd', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
