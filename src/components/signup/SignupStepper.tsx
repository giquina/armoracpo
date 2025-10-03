import React from 'react';
import { motion } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';
import { IconWrapper } from '../../utils/IconWrapper';
import './SignupStepper.css';

export interface SignupStep {
  id: number;
  label: string;
}

export interface SignupStepperProps {
  currentStep: number;
  totalSteps: number;
  steps: SignupStep[];
}

export const SignupStepper: React.FC<SignupStepperProps> = ({
  currentStep,
  totalSteps,
  steps,
}) => {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="armora-signup-stepper">
      {/* Progress Bar */}
      <div className="armora-signup-stepper__progress-container">
        <div className="armora-signup-stepper__progress-track">
          <motion.div
            className="armora-signup-stepper__progress-bar"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="armora-signup-stepper__steps">
        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isUpcoming = step.id > currentStep;

          const stepClasses = [
            'armora-signup-stepper__step',
            isCompleted && 'armora-signup-stepper__step--completed',
            isCurrent && 'armora-signup-stepper__step--current',
            isUpcoming && 'armora-signup-stepper__step--upcoming',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div key={step.id} className={stepClasses}>
              <motion.div
                className="armora-signup-stepper__step-indicator"
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  backgroundColor: isCompleted
                    ? 'var(--armora-success)'
                    : isCurrent
                    ? 'var(--armora-gold)'
                    : 'var(--armora-bg-tertiary)',
                }}
                transition={{ duration: 0.2 }}
              >
                {isCompleted ? (
                  <IconWrapper icon={FaCheck} className="armora-signup-stepper__check" />
                ) : (
                  <span className="armora-signup-stepper__step-number">{step.id}</span>
                )}
              </motion.div>
              <span className="armora-signup-stepper__step-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
