import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { Camera, Check, Upload } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { Button } from './Button';
import { useDelivery } from '@/contexts/DeliveryContext';

interface DeliveryStepperProps {
  onStepComplete: (step: string, data?: any) => void;
  currentStep: number;
  isCompleted: boolean;
  deliveryId?: string;
  deliveryData?: any;
  expanded?: boolean;
}

interface StepData {
  id: string;
  title: string;
  completed: boolean;
  disabled: boolean;
  expanded: boolean;
}

export function DeliveryStepper({ 
  onStepComplete, 
  currentStep, 
  isCompleted, 
  deliveryId, 
  deliveryData,
  expanded = false 
}: DeliveryStepperProps) {
  const [smsCode, setSmsCode] = useState('');
  const [pickupImage, setPickupImage] = useState<string | null>(null);
  const [deliveryImage, setDeliveryImage] = useState<string | null>(null);
  const [recipientCode, setRecipientCode] = useState('');
  const { uploadImage, verifyCode, loading, sendSMSCode } = useDelivery();

  const steps: StepData[] = [
    {
      id: 'pickup_sms',
      title: 'Send SMS to client for pickup',
      completed: currentStep > 0,
      disabled: false,
      expanded: true,
    },
    {
      id: 'pickup_image',
      title: 'Take pickup confirmation photo',
      completed: currentStep > 1,
      disabled: currentStep < 1,
      expanded: currentStep >= 1,
    },
    {
      id: 'dropoff_sms',
      title: 'Send SMS to recipient for dropoff',
      completed: currentStep > 2,
      disabled: currentStep < 2,
      expanded: currentStep >= 2,
    },
    {
      id: 'dropoff_image',
      title: 'Take dropoff confirmation photo',
      completed: currentStep > 3,
      disabled: currentStep < 3,
      expanded: currentStep >= 3,
    },
  ];

  const handleStepAction = (stepId: string, data?: any) => {
    onStepComplete(stepId, data);
  };

  const handleSendSMS = async (type: 'pickup' | 'dropoff', stepId: string) => {
    if (!deliveryId) return;
    
    try {
      await sendSMSCode(deliveryId, type);
      handleStepAction(stepId);
    } catch (error) {
      console.error('Failed to send SMS:', error);
    }
  };

  const handleImageUpload = (type: 'pickup' | 'delivery') => {
    // In a real app, this would open camera/gallery
    const mockImageUri = 'https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2';
    
    if (type === 'pickup') {
      setPickupImage(mockImageUri);
      if (deliveryId) {
        uploadImage(deliveryId, mockImageUri, 'pickup').then(() => {
          handleStepAction('pickup_image', { image: mockImageUri });
        });
      } else {
        handleStepAction('pickup_image', { image: mockImageUri });
      }
    } else {
      setDeliveryImage(mockImageUri);
      if (deliveryId) {
        uploadImage(deliveryId, mockImageUri, 'dropoff').then(() => {
          handleStepAction('delivery_image', { image: mockImageUri });
        });
      } else {
        handleStepAction('delivery_image', { image: mockImageUri });
      }
    }
  };

  const handleCodeVerification = async (code: string, type: 'pickup' | 'dropoff', stepId: string) => {
    if (!deliveryId) {
      handleStepAction(stepId, { code });
      return;
    }

    const isValid = await verifyCode(deliveryId, code, type);
    if (isValid) {
      handleStepAction(stepId, { code });
    } else {
      // Handle invalid code - you might want to show an error message
      console.error('Invalid verification code');
    }
  };

  if (isCompleted) {
    return (
      <View style={styles.completionContainer}>
        <View style={styles.completionIcon}>
          <Check size={32} color={Colors.light.success} />
        </View>
        <Text style={styles.completionTitle}>Delivery Completed!</Text>
        <Text style={styles.completionMessage}>
          You have completed the delivery! Sonic Africa will send in your payment soon.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, expanded && styles.expandedContainer]}>
      <Text style={styles.title}>Delivery Steps</Text>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        
        return (
          <View key={step.id} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIndicator}>
                <View style={[
                  styles.bullet,
                  step.completed && styles.bulletCompleted,
                  step.disabled && styles.bulletDisabled
                ]}>
                  {step.completed && <Check size={12} color={Colors.light.background} />}
                </View>
                {!isLast && (
                  <View style={[
                    styles.connector,
                    step.completed && styles.connectorCompleted
                  ]} />
                )}
              </View>
              
              <View style={styles.stepContent}>
                <Text style={[
                  styles.stepTitle,
                  step.disabled && styles.stepTitleDisabled
                ]}>
                  {step.title}
                </Text>
                
                {expanded && step.expanded && !step.disabled && (
                  <View style={styles.stepActions}>
                    {step.id === 'pickup_sms' && !step.completed && (
                      <TouchableOpacity 
                        style={styles.smsButton}
                        onPress={() => handleSendSMS('pickup', 'pickup_sms')}
                        disabled={loading}
                      >
                        <Text style={styles.smsButtonText}>
                          {loading ? 'Sending...' : 'Send SMS'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    {step.id === 'pickup_image' && !step.completed && (
                      <View style={styles.imageUploadContainer}>
                        {pickupImage ? (
                          <View style={styles.imagePreview}>
                            <Image source={{ uri: pickupImage }} style={styles.previewImage} />
                            <TouchableOpacity 
                              style={styles.confirmButton}
                              onPress={() => handleStepAction('pickup_image', { image: pickupImage })}
                            >
                              <Text style={styles.confirmButtonText}>Confirm</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity 
                            style={styles.uploadButton}
                            onPress={() => handleImageUpload('pickup')}
                          >
                            <Camera size={20} color={Colors.light.primary} />
                            <Text style={styles.uploadButtonText}>Take Photo</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                    
                    {step.id === 'dropoff_sms' && !step.completed && (
                      <TouchableOpacity 
                        style={styles.smsButton}
                        onPress={() => handleSendSMS('dropoff', 'dropoff_sms')}
                        disabled={loading}
                      >
                        <Text style={styles.smsButtonText}>
                          {loading ? 'Sending...' : 'Send SMS'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    {step.id === 'dropoff_image' && !step.completed && (
                      <View style={styles.imageUploadContainer}>
                        {deliveryImage ? (
                          <View style={styles.imagePreview}>
                            <Image source={{ uri: deliveryImage }} style={styles.previewImage} />
                            <TouchableOpacity 
                              style={styles.confirmButton}
                              onPress={() => handleStepAction('dropoff_image', { image: deliveryImage })}
                            >
                              <Text style={styles.confirmButtonText}>Confirm</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity 
                            style={styles.uploadButton}
                            onPress={() => handleImageUpload('delivery')}
                          >
                            <Camera size={20} color={Colors.light.primary} />
                            <Text style={styles.uploadButtonText}>Take Photo</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  expandedContainer: {
    minHeight: 300,
  },
  title: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    marginBottom: SPACING.lg,
  },
  stepContainer: {
    marginBottom: SPACING.md,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },

  //the side bullet progress checkers
  bullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulletCompleted: {
    backgroundColor: Colors.light.success,
    borderColor: Colors.light.success,
  },
  bulletDisabled: {
    borderColor: Colors.light.disabled,
    backgroundColor: Colors.light.disabled,
  },
  connector: {
    width: 2,
    height: 40,
    backgroundColor: Colors.light.border,
    marginTop: 4,
  },
  connectorCompleted: {
    backgroundColor: Colors.light.success,
  },
  stepContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitle: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    marginBottom: SPACING.sm,
  },
  stepTitleDisabled: {
    color: Colors.light.placeholder,
  },
  stepActions: {
    marginTop: SPACING.xs,
  },
  smsButton: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  smsButtonText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.background,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  codeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.light.disabled,
  },
  submitButtonText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.background,
  },
  submitButtonTextDisabled: {
    color: Colors.light.placeholder,
  },
  imageUploadContainer: {
    marginTop: SPACING.xs,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  uploadButtonText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.primary,
    marginLeft: SPACING.xs,
  },
  imagePreview: {
    alignItems: 'center',
  },
  previewImage: {
    width: 120,
    height: 80,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  confirmButton: {
    backgroundColor: Colors.light.success,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  confirmButtonText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.background,
  },
  completionContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  completionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${Colors.light.success}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  completionTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.lg,
    color: Colors.light.text,
    marginBottom: SPACING.sm,
  },
  completionMessage: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: Colors.light.placeholder,
    textAlign: 'center',
    lineHeight: 20,
  },
});