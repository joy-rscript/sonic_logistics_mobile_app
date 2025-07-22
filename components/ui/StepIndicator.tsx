import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE } from '@/constants/Theme';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <React.Fragment key={stepNumber}>
              <View style={styles.stepWrapper}>
                <View
                  style={[
                    styles.stepCircle,
                    isCompleted && styles.completedStep,
                    isCurrent && styles.currentStep,
                  ]}
                >
                  {isCompleted ? (
                    <Check size={16} color="#fff" />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumber,
                        (isCompleted || isCurrent) && styles.activeStepNumber,
                      ]}
                    >
                      {stepNumber}
                    </Text>
                  )}
                </View>
                <Text style={[styles.stepTitle, isCurrent && styles.currentStepTitle]}>
                  {stepTitles[index]}
                </Text>
              </View>
              
              {index < totalSteps - 1 && (
                <View
                  style={[
                    styles.connector,
                    isCompleted && styles.completedConnector,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  completedStep: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  currentStep: {
    backgroundColor: Colors.light.background,
    borderColor: Colors.light.primary,
  },
  stepNumber: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: '#999',
  },
  activeStepNumber: {
    color: Colors.light.primary,
  },
  stepTitle: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontWeight: '500',
  },
  currentStepTitle: {
    color: Colors.light.text,
    fontWeight: '600',
  },
  connector: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#E0E0E0',
    zIndex: -1,
  },
  completedConnector: {
    backgroundColor: Colors.light.primary,
  },
});