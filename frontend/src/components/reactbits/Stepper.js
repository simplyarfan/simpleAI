'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange,
  onFinalStepCompleted,
  backButtonText = 'Previous',
  nextButtonText = 'Next'
}) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const steps = Array.isArray(children) ? children : [children];

  const goToNextStep = () => {
    if (currentStep < steps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepChange?.(nextStep);
      
      if (nextStep === steps.length && onFinalStepCompleted) {
        onFinalStepCompleted();
      }
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepChange?.(prevStep);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Step Indicators */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((_, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                index + 1 === currentStep
                  ? 'bg-blue-600 text-white scale-110'
                  : index + 1 < currentStep
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-1 mx-2 transition-all duration-300 ${
                  index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-6"
      >
        {steps[currentStep - 1]}
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={goToPreviousStep}
          disabled={currentStep === 1}
          className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {backButtonText}
        </button>
        <button
          onClick={goToNextStep}
          disabled={currentStep === steps.length}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {currentStep === steps.length ? 'Complete' : nextButtonText}
        </button>
      </div>
    </div>
  );
}

export function Step({ children }) {
  return <div>{children}</div>;
}
