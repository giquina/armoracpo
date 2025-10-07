import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  FaBriefcase,
  FaPoundSign,
  FaBell,
  FaShieldAlt,
  FaFileAlt,
  FaUserCheck,
  FaChartLine,
  FaStar,
  FaTrophy,
} from 'react-icons/fa';
import { Button } from '../../components/ui/Button';
import { FeatureCard } from '../../components/onboarding/FeatureCard';
import { PageIndicator } from '../../components/onboarding/PageIndicator';
import './Welcome.css';

interface WelcomePageData {
  id: number;
  title: string;
  subtitle: string;
  features: {
    icon: any;
    title: string;
    description: string;
  }[];
}

const WELCOME_PAGES: WelcomePageData[] = [
  {
    id: 0,
    title: 'For Professional CPOs',
    subtitle: 'Your gateway to verified security assignments',
    features: [
      {
        icon: FaBriefcase,
        title: 'Verified SIA Jobs',
        description: 'Access exclusive assignments from vetted security firms and verified clients',
      },
      {
        icon: FaPoundSign,
        title: 'Competitive Rates',
        description: 'Fair compensation with transparent pricing and instant payment tracking',
      },
      {
        icon: FaBell,
        title: 'Real-Time Notifications',
        description: 'Never miss opportunities with instant job alerts and assignment updates',
      },
    ],
  },
  {
    id: 1,
    title: 'Trust & Safety',
    subtitle: 'Professional protection in every assignment',
    features: [
      {
        icon: FaUserCheck,
        title: 'Vetted Clients',
        description: 'Work with verified organizations that meet industry standards',
      },
      {
        icon: FaShieldAlt,
        title: 'Insurance Protection',
        description: 'Comprehensive coverage and support for every assignment',
      },
      {
        icon: FaFileAlt,
        title: 'Digital DOB',
        description: 'Streamlined incident reporting and digital occurrence book management',
      },
    ],
  },
  {
    id: 2,
    title: 'Career Growth',
    subtitle: 'Build your professional reputation',
    features: [
      {
        icon: FaChartLine,
        title: 'Performance Tracking',
        description: 'Monitor your progress with detailed analytics and assignment history',
      },
      {
        icon: FaStar,
        title: 'Build Reputation',
        description: 'Earn ratings and reviews to unlock better opportunities',
      },
      {
        icon: FaTrophy,
        title: 'Premium Assignments',
        description: 'Access high-value contracts and exclusive close protection roles',
      },
    ],
  },
];

const SWIPE_THRESHOLD = 50;
const SWIPE_CONFIDENCE_THRESHOLD = 10000;

const swipeConfidencePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export const Welcome: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < WELCOME_PAGES.length) {
      setDirection(newPage > currentPage ? 1 : -1);
      setCurrentPage(newPage);
    }
  };

  const handleSwipe = (offset: number, velocity: number) => {
    const swipe = swipeConfidencePower(offset, velocity);

    if (swipe < -SWIPE_CONFIDENCE_THRESHOLD && currentPage < WELCOME_PAGES.length - 1) {
      handlePageChange(currentPage + 1);
    } else if (swipe > SWIPE_CONFIDENCE_THRESHOLD && currentPage > 0) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    handleSwipe(info.offset.x, info.velocity.x);
  };

  const handleSignIn = () => {
    console.log('Navigate to Sign In');
    // TODO: Implement navigation to sign in
  };

  const handleSignUp = () => {
    console.log('Navigate to Sign Up');
    // TODO: Implement navigation to sign up
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const currentPageData = WELCOME_PAGES[currentPage];

  return (
    <div className="welcome">
      <div className="welcome__container">
        {/* Header Section */}
        <motion.div
          className="welcome__header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="welcome__brand">ARMORA</h1>
          <p className="welcome__tagline">Close Protection Officers</p>
        </motion.div>

        {/* Carousel Content */}
        <div className="welcome__carousel">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentPage}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={handleDragEnd}
              className="welcome__page"
            >
              <motion.div
                className="welcome__page-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="welcome__title">{currentPageData.title}</h2>
                <p className="welcome__subtitle">{currentPageData.subtitle}</p>

                <div className="welcome__features">
                  {currentPageData.features.map((feature, index) => (
                    <FeatureCard
                      key={index}
                      icon={feature.icon}
                      title={feature.title}
                      description={feature.description}
                      delay={0.1 * (index + 1)}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Page Indicator */}
        <div className="welcome__indicators">
          <PageIndicator
            totalPages={WELCOME_PAGES.length}
            currentPage={currentPage}
            onPageClick={handlePageChange}
          />
        </div>

        {/* Action Buttons */}
        <motion.div
          className="welcome__actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={handleSignIn}
            className="welcome__button"
          >
            Sign In
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={handleSignUp}
            className="welcome__button"
          >
            Sign Up
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;
