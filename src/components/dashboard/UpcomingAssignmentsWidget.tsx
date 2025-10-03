import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiClock, FiDollarSign, FiArrowRight } from 'react-icons/fi';
import { Button } from '../ui/Button';
import './UpcomingAssignmentsWidget.css';

export interface Assignment {
  id: string;
  title: string;
  clientName: string;
  location: { area: string };
  startDate: Date;
  endDate: Date;
  duration: string;
  payRate: number;
  status: 'confirmed' | 'pending' | 'in_progress';
}

export interface UpcomingAssignmentsWidgetProps {
  assignments: Assignment[];
  onViewAll: () => void;
}

export const UpcomingAssignmentsWidget: React.FC<UpcomingAssignmentsWidgetProps> = ({
  assignments,
  onViewAll,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'navy';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: Assignment['status']) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      default:
        return status;
    }
  };

  return (
    <div className="upcoming-assignments-widget">
      <div className="upcoming-assignments-widget__header">
        <div className="upcoming-assignments-widget__header-content">
          <FiCalendar className="upcoming-assignments-widget__header-icon" />
          <h2 className="upcoming-assignments-widget__title">Upcoming Assignments</h2>
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

      <div className="upcoming-assignments-widget__list">
        {assignments.length === 0 ? (
          <div className="upcoming-assignments-widget__empty">
            <FiCalendar className="upcoming-assignments-widget__empty-icon" />
            <p className="upcoming-assignments-widget__empty-text">
              No upcoming assignments
            </p>
          </div>
        ) : (
          assignments.slice(0, 5).map((assignment, index) => (
            <motion.div
              key={assignment.id}
              className="upcoming-assignments-widget__item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="upcoming-assignments-widget__item-date">
                <div className="upcoming-assignments-widget__item-day">
                  {assignment.startDate.getDate()}
                </div>
                <div className="upcoming-assignments-widget__item-month">
                  {assignment.startDate.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}
                </div>
              </div>

              <div className="upcoming-assignments-widget__item-content">
                <div className="upcoming-assignments-widget__item-header">
                  <h3 className="upcoming-assignments-widget__item-title">
                    {assignment.title}
                  </h3>
                  <span className={`upcoming-assignments-widget__item-status upcoming-assignments-widget__item-status--${getStatusColor(assignment.status)}`}>
                    {getStatusLabel(assignment.status)}
                  </span>
                </div>

                <div className="upcoming-assignments-widget__item-details">
                  <div className="upcoming-assignments-widget__item-detail">
                    <FiMapPin className="upcoming-assignments-widget__item-icon" />
                    <span>{assignment.location.area}</span>
                  </div>
                  <div className="upcoming-assignments-widget__item-detail">
                    <FiClock className="upcoming-assignments-widget__item-icon" />
                    <span>{assignment.duration}</span>
                  </div>
                  <div className="upcoming-assignments-widget__item-detail">
                    <FiDollarSign className="upcoming-assignments-widget__item-icon" />
                    <span>£{assignment.payRate}/hr</span>
                  </div>
                </div>

                <div className="upcoming-assignments-widget__item-time">
                  {formatDate(assignment.startDate)} - {formatDate(assignment.endDate)}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
