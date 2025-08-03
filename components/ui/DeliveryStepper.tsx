import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { Camera, Check, Upload, MessageSquare, Phone } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { Button } from './Button';
import { useDelivery } from '@/contexts/DeliveryContext';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
a
interface DeliveryStepperProps {
  onStepComplete: (step: string, data?: any) => void;
  currentStep: number;
  isCompleted: boolean;
  deliveryId?: string;
  deliveryData?: any;
}

interface StepData {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  disabled: boolean;
  expanded: boolean;
}

export function DeliveryStepper({ onStepComplete, currentStep, isCompleted, deliveryId, deliveryData }: DeliveryStepperProps) {
  const [pickupSmsCode, setPickupSmsCode] = useState('');
  const [dropoffSmsCode, setDropoffSmsCode] = useState('');
  const [pickupImage, setPickupImage] = useState<string | null>(null);
  const [deliveryImage, setDeliveryImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { uploadImage, verifyCode, loading, sendSMSCode } = useDelivery();

  const steps: StepData[] = [
    {
      id: 'pickup_sms',
      title: 'Enter pickup verification code',
      description: 'Enter the SMS code sent to your phone to verify pickup location',
      completed: currentStep > 0,
      disabled: false,
      expanded: true,
    },
    {
      id: 'pickup_image',
      title: 'Take pickup photo',
      description: 'Take a photo of the package at pickup location for verification',
      completed: currentStep > 1,
      disabled: currentStep < 1,
      expanded: currentStep >= 1,
    },
    {
      id: 'dropoff_sms',
      title: 'Enter recipient verification code',
      description: 'Enter the SMS code sent to the recipient to verify drop-off',
      completed: currentStep > 2,
      disabled: currentStep < 2,
      expanded: currentStep >= 2,
    },
    {
      id: 'dropoff_image',
      title: 'Take delivery photo',
      description: 'Take a photo of the delivered package for completion verification',
      completed: currentStep > 3,
      disabled: currentStep < 3,
      expanded: currentStep >= 3,
    },
  ];

  const handleStepAction = (stepId: string, data?: any) => {
    onStepComplete(stepId, data);
  };

  const handleImageUpload = async (type: 'pickup' | 'dropoff') => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to take photos');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setIsUploadingImage(true);

        if (type === 'pickup') {
          setPickupImage(imageUri);
          if (deliveryId) {
            await uploadImage(deliveryId, imageUri, 'pickup');
          }
          handleStepAction('pickup_image', { image: imageUri });
        } else {
          setDeliveryImage(imageUri);
          if (deliveryId) {
            await uploadImage(deliveryId, imageUri, 'dropoff');
          }
          handleStepAction('dropoff_image', { image: imageUri });
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSMSVerification = async (code: string, type: 'pickup' | 'dropoff', stepId: string) => {
    if (!deliveryId) {
      handleStepAction(stepId, { code });
      return;
    }

    const isValid = await verifyCode(deliveryId, code, type);
    if (isValid) {
      handleStepAction(stepId, { code });
      
      // Send SMS for next step if needed
      if (type === 'pickup' && stepId === 'pickup_sms') {
        // After pickup SMS verification, we can proceed to photo
        // No additional SMS needed for pickup photo
      } else if (type === 'dropoff' && stepId === 'dropoff_sms') {
        // After dropoff SMS verification, we can proceed to final photo
        // No additional SMS needed for dropoff photo
      }
    } else {
      Alert.alert('Invalid Code', 'The verification code you entered is incorrect. Please try again.');
    }
  };

  const requestSMSCode = async (type: 'pickup' | 'dropoff') => {
    if (!deliveryId) return;
    
    try {
      await sendSMSCode(deliveryId, type);
      Alert.alert(
        'SMS Sent', 
        `Verification code has been sent to ${type === 'pickup' ? 'your phone' : 'the recipient\'s phone'}.`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send SMS code. Please try again.');
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
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      
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
                
                <Text style={[
                  styles.stepDescription,
                  step.disabled && styles.stepDescriptionDisabled
                ]}>
                  {step.description}
                </Text>
                
                {step.expanded && !step.disabled && (
                  <View style={styles.stepActions}>
                    {step.id === 'pickup_sms' && !step.completed && (
                      <View style={styles.inputContainer}>
                        <View style={styles.smsHeader}>
                          <Text style={styles.smsInstructions}>
                            Enter the 6-digit code sent to your phone
                          </Text>
                          <TouchableOpacity 
                            style={styles.resendButton}
                            onPress={() => requestSMSCode('pickup')}
                          >
                            <MessageSquare size={16} color={Colors.light.primary} />
                            <Text style={styles.resendButtonText}>Resend SMS</Text>
                          </TouchableOpacity>
                        </View>
                        <TextInput
                          style={styles.codeInput}
                          placeholder="Enter 6-digit code"
                          placeholderTextColor={Colors.light.placeholder}
                          value={pickupSmsCode}
                          onChangeText={setPickupSmsCode}
                          keyboardType="numeric"
                          maxLength={6}
                        />
                        <TouchableOpacity 
                          style={[styles.submitButton, (!pickupSmsCode || loading) && styles.submitButtonDisabled]}
                          onPress={() => {
                            if (pickupSmsCode) {
                              handleSMSVerification(pickupSmsCode, 'pickup', 'pickup_sms');
                            }
                          }}
                          disabled={!pickupSmsCode || loading}
                        >
                          <Text style={[styles.submitButtonText, (!pickupSmsCode || loading) && styles.submitButtonTextDisabled]}>
                            {loading ? 'Verifying...' : 'Submit'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    
                    {step.id === 'pickup_image' && !step.completed && (
                      <View style={styles.imageUploadContainer}>
                        <Text style={styles.imageInstructions}>
                          Take a clear photo of the package at pickup location
                        </Text>
                        {pickupImage ? (
                          <View style={styles.imagePreview}>
                            <Image source={{ uri: pickupImage }} style={styles.previewImage} />
                            <TouchableOpacity 
                              style={styles.confirmButton}
                              onPress={() => handleStepAction('pickup_image', { image: pickupImage })}
                              disabled={isUploadingImage}
                            >
                              <Text style={styles.confirmButtonText}>
                                {isUploadingImage ? 'Uploading...' : 'Confirm Photo'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity 
                            style={styles.uploadButton}
                            onPress={() => handleImageUpload('pickup')}
                            disabled={isUploadingImage}
                          >
                            <Camera size={20} color={Colors.light.primary} />
                            <Text style={styles.uploadButtonText}>
                              {isUploadingImage ? 'Processing...' : 'Take Pickup Photo'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                    
                    {step.id === 'dropoff_sms' && !step.completed && (
                      <View style={styles.inputContainer}>
                        <View style={styles.smsHeader}>
                          <Text style={styles.smsInstructions}>
                            Enter the code sent to the recipient's phone
                          </Text>
                          <TouchableOpacity 
                            style={styles.resendButton}
                            onPress={() => requestSMSCode('dropoff')}
                          >
                            <Phone size={16} color={Colors.light.primary} />
                            <Text style={styles.resendButtonText}>Send to Recipient</Text>
                          </TouchableOpacity>
                        </View>
                        <TextInput
                          style={styles.codeInput}
                          placeholder="Enter 6-digit code"
                          placeholderTextColor={Colors.light.placeholder}
                          value={dropoffSmsCode}
                          onChangeText={setDropoffSmsCode}
                          keyboardType="numeric"
                          maxLength={6}
                        />
                        <TouchableOpacity 
                          style={[styles.submitButton, (!dropoffSmsCode || loading) && styles.submitButtonDisabled]}
                          onPress={() => {
                            if (dropoffSmsCode) {
                              handleSMSVerification(dropoffSmsCode, 'dropoff', 'dropoff_sms');
                            }
                          }}
                          disabled={!dropoffSmsCode || loading}
                        >
                          <Text style={[styles.submitButtonText, (!dropoffSmsCode || loading) && styles.submitButtonTextDisabled]}>
                            {loading ? 'Verifying...' : 'Submit'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    
                    {step.id === 'dropoff_image' && !step.completed && (
                      <View style={styles.imageUploadContainer}>
                        <Text style={styles.imageInstructions}>
                          Take a photo of the delivered package at drop-off location
                        </Text>
                        {deliveryImage ? (
                          <View style={styles.imagePreview}>
                            <Image source={{ uri: deliveryImage }} style={styles.previewImage} />
                            <TouchableOpacity 
                              style={styles.confirmButton}
                              onPress={() => handleStepAction('dropoff_image', { image: deliveryImage })}
                              disabled={isUploadingImage}
                            >
                              <Text style={styles.confirmButtonText}>
                                {isUploadingImage ? 'Uploading...' : 'Complete Delivery'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity 
                            style={styles.uploadButton}
                            onPress={() => handleImageUpload('dropoff')}
                            disabled={isUploadingImage}
                          >
                            <Camera size={20} color={Colors.light.primary} />
                            <Text style={styles.uploadButtonText}>
                              {isUploadingImage ? 'Processing...' : 'Take Delivery Photo'}
                            </Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: BORDER_RADIUS.lg,
  },
  scrollContent: {
    padding: SPACING.sm,
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
  stepDescription: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
    marginBottom: SPACING.sm,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  stepDescriptionDisabled: {
    color: Colors.light.disabled,
  },
  stepActions: {
    marginTop: SPACING.xs,
  },
  smsHeader: {
    marginBottom: SPACING.md,
  },
  smsInstructions: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: `${Colors.light.primary}10`,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    gap: SPACING.xs,
  },
  resendButtonText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.primary,
  },
  imageInstructions: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  doneButton: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  doneButtonText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.background,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  codeInput: {
    flex: 1,
    minWidth: 120,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    textAlign: 'center',
    letterSpacing: 2,
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 80,
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
    alignItems: 'center',
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
    minHeight: 60,
    gap: SPACING.sm,
  },
  uploadButtonText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.primary,
  },
  imagePreview: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: BORDER_RADIUS.sm,
  },
  confirmButton: {
    backgroundColor: Colors.light.success,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 120,
  },
  confirmButtonText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.background,
    textAlign: 'center',
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
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  progressTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.lg,
    color: Colors.light.text,
  },
  locationContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  locationLabel: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    minWidth: 70,
  },
  locationText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
    flex: 1,
    marginLeft: SPACING.sm,
  },
  expandText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.primary,
    fontStyle: 'italic',
    marginLeft: SPACING.sm,
  },
});