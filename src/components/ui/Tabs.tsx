import React from 'react';
import { motion } from 'framer-motion';
import './Tabs.css';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}) => {
  const containerClasses = ['armora-tabs', className].filter(Boolean).join(' ');

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className={containerClasses}>
      <div className="armora-tabs__header" role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              className={`armora-tabs__button ${isActive ? 'armora-tabs__button--active' : ''}`}
              onClick={() => onTabChange(tab.id)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
            >
              {tab.icon && <span className="armora-tabs__icon">{tab.icon}</span>}
              <span className="armora-tabs__label">{tab.label}</span>
              {isActive && (
                <motion.div
                  className="armora-tabs__indicator"
                  layoutId="activeTab"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="armora-tabs__content">
        {activeTabData && (
          <motion.div
            key={activeTab}
            className="armora-tabs__panel"
            role="tabpanel"
            id={`panel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTabData.content}
          </motion.div>
        )}
      </div>
    </div>
  );
};
