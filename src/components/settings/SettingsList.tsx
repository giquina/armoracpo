import React from 'react';
import { FiChevronRight } from 'react-icons/fi';
import './SettingsList.css';

export interface SettingItem {
  id: string;
  label: string;
  icon: string;
  value?: string;
  onClick?: () => void;
  showChevron?: boolean;
}

export interface SettingSection {
  title: string;
  items: SettingItem[];
}

interface SettingsListProps {
  sections: SettingSection[];
}

const SettingsList: React.FC<SettingsListProps> = ({ sections }) => {
  return (
    <div className="settings-list">
      {sections.map((section, index) => (
        <div key={index} className="settings-list__section">
          <h3 className="settings-list__section-title">{section.title}</h3>
          <div className="settings-list__items">
            {section.items.map((item) => (
              <button
                key={item.id}
                className="settings-list__item"
                onClick={item.onClick}
              >
                <span className="settings-list__item-icon">{item.icon}</span>
                <div className="settings-list__item-content">
                  <span className="settings-list__item-label">{item.label}</span>
                  {item.value && (
                    <span className="settings-list__item-value">{item.value}</span>
                  )}
                </div>
                {item.showChevron !== false && (
                  <FiChevronRight className="settings-list__item-chevron" size={20} />
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SettingsList;
