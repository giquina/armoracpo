import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiActivity,
  FiCheckCircle,
  FiXCircle,
  FiBriefcase,
  FiMessageSquare,
  FiDollarSign,
  FiStar,
  FiArrowRight,
} from 'react-icons/fi';
import { Button } from '../ui/Button';
import './RecentActivityFeed.css';

export interface Activity {
  id: string;
  type:
    | 'application_submitted'
    | 'application_accepted'
    | 'application_rejected'
    | 'job_match'
    | 'message_received'
    | 'payment_received'
    | 'review_received';
  title: string;
  description: string;
  timestamp: Date;
  icon?: React.ReactNode;
  link?: string;
}

export interface RecentActivityFeedProps {
  activities: Activity[];
  onViewAll: () => void;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities,
  onViewAll,
}) => {
  const navigate = useNavigate();

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'application_submitted':
        return <FiBriefcase />;
      case 'application_accepted':
        return <FiCheckCircle />;
      case 'application_rejected':
        return <FiXCircle />;
      case 'job_match':
        return <FiBriefcase />;
      case 'message_received':
        return <FiMessageSquare />;
      case 'payment_received':
        return <FiDollarSign />;
      case 'review_received':
        return <FiStar />;
      default:
        return <FiActivity />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'application_accepted':
      case 'payment_received':
      case 'review_received':
        return 'success';
      case 'application_rejected':
        return 'danger';
      case 'job_match':
        return 'gold';
      case 'message_received':
        return 'navy';
      default:
        return 'secondary';
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const handleActivityClick = (activity: Activity) => {
    if (activity.link) {
      navigate(activity.link);
    }
  };

  return (
    <div className="recent-activity-feed">
      <div className="recent-activity-feed__header">
        <div className="recent-activity-feed__header-content">
          <FiActivity className="recent-activity-feed__header-icon" />
          <h2 className="recent-activity-feed__title">Recent Activity</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={<FiArrowRight />}
          iconPosition="right"
          onClick={onViewAll}
        >
          View All
        </Button>
      </div>

      <div className="recent-activity-feed__timeline">
        {activities.length === 0 ? (
          <div className="recent-activity-feed__empty">
            <FiActivity className="recent-activity-feed__empty-icon" />
            <p className="recent-activity-feed__empty-text">No recent activity</p>
          </div>
        ) : (
          activities.slice(0, 10).map((activity, index) => (
            <motion.div
              key={activity.id}
              className={`recent-activity-feed__item ${
                activity.link ? 'recent-activity-feed__item--clickable' : ''
              }`}
              onClick={() => handleActivityClick(activity)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="recent-activity-feed__item-line" />
              <div
                className={`recent-activity-feed__item-icon recent-activity-feed__item-icon--${getActivityColor(
                  activity.type
                )}`}
              >
                {activity.icon || getActivityIcon(activity.type)}
              </div>
              <div className="recent-activity-feed__item-content">
                <h3 className="recent-activity-feed__item-title">{activity.title}</h3>
                <p className="recent-activity-feed__item-description">{activity.description}</p>
                <span className="recent-activity-feed__item-time">
                  {getRelativeTime(activity.timestamp)}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
