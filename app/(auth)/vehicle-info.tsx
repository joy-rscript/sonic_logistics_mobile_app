import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { CheckCircle, AlertCircle, Info } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE } from '@/constants/Theme';
import { Button } from '@/components/ui/Button';
import { courierOnboarding } from '@/utils/authApi';
import { 
  verifyNumberPlate, 
  verifyDrivingLicense, 
  getVehicleRegistration,
  verifyVehicleInsurance,
  formatNumberPlate,
  VehicleVerificationResult,
  LicenseVerificationResult 
} from '@/utils/vehicleVerificationApi';

interface FormData {
  vehicleType: string;
  drivingLicense: string;
  vehicleCapacity: string;
  insuranceCompany: string;
  plateNumber: string;
  vehicleModel: string;
}

interface VerificationState {
  plateVerification: VehicleVerificationResult | null;
  licenseVerification: LicenseVerificationResult | null;
  isVerifyingPlate: boolean;
  isVerifyingLicense: boolean;
  isVerifyingInsurance: boolean;
}

export default function VehicleInfoScreen() {
  const [formData, setFormData] = useState<FormData>({
    vehicleType: '',
    drivingLicense: '',
    vehicleCapacity: '',
    insuranceCompany: '',
    plateNumber: '',
    vehicleModel: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [verification, setVerification] = useState<VerificationState>({
    plateVerification: null,
    licenseVerification: null,
    isVerifyingPlate: false,
    isVerifyingLicense: false,
    isVerifyingInsurance: false,
  });

  // Verify number plate when user finishes typing
  const handlePlateVerification = async (plateNumber: string) => {
    if (plateNumber.length < 6) return;
    
    setVerification(prev => ({ ...prev, isVerifyingPlate: true }));
    try {
      const result = await verifyNumberPlate(plateNumber);
      setVerification(prev => ({ ...prev, plateVerification: result }));
      
      if (result.isValid) {
        // Auto-format the plate number
        const formatted = formatNumberPlate(plateNumber, result.countryCode);
        updateFormData('plateNumber', formatted);
        
        // Try to get vehicle registration details
        const registration = await getVehicleRegistration(plateNumber);
        if (registration) {
          updateFormData('vehicleType', registration.vehicleType);
          updateFormData('vehicleModel', registration.vehicleModel);
        }
      }
    } catch (error) {
      console.error('Plate verification error:', error);
    } finally {
      setVerification(prev => ({ ...prev, isVerifyingPlate: false }));
    }
  };

  // Verify driving license when user finishes typing
  const handleLicenseVerification = async (licenseNumber: string) => {
    if (licenseNumber.length < 8) return;
    
    setVerification(prev => ({ ...prev, isVerifyingLicense: true }));
    try {
      const result = await verifyDrivingLicense(licenseNumber);
      setVerification(prev => ({ ...prev, licenseVerification: result }));
      
      if (!result.isActive && result.isValid) {
        Alert.alert(
          'License Warning',
          'This license may have restrictions or be suspended. Please verify with local authorities.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('License verification error:', error);
    } finally {
      setVerification(prev => ({ ...prev, isVerifyingLicense: false }));
    }
  };

  // Verify vehicle insurance
  const handleInsuranceVerification = async () => {
    if (!formData.plateNumber || !formData.insuranceCompany) return;
    
    setVerification(prev => ({ ...prev, isVerifyingInsurance: true }));
    try {
      const result = await verifyVehicleInsurance(formData.plateNumber, formData.insuranceCompany);
      
      if (!result.isValid || !result.isActive) {
        Alert.alert(
          'Insurance Warning',
          'Vehicle insurance could not be verified or may be expired. Please ensure your insurance is active.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Insurance verification error:', error);
    } finally {
      setVerification(prev => ({ ...prev, isVerifyingInsurance: false }));
    }
  };

  const handleContinue = async () => {
    if (isLoading) return;
    
    // Check if verifications are valid
    if (verification.plateVerification && !verification.plateVerification.isValid) {
      Alert.alert('Invalid Number Plate', 'Please enter a valid East African number plate format.');
      return;
    }
    
    if (verification.licenseVerification && !verification.licenseVerification.isValid) {
      Alert.alert('Invalid License', 'Please enter a valid East African driving license format.');
      return;
    }
    
    setIsLoading(true);
    try {
      // Get user ID from secure store
      const userId = await SecureStore.getItemAsync('userId');
      
      if (!userId) {
        Alert.alert('Error', 'User data not found. Please register again.');
        router.replace('/(auth)/register');
        return;
      }
      
      // Call courier onboarding API
      const response = await courierOnboarding({
        userId,
        driving_license_no: formData.drivingLicense,
        vehicle_type: formData.vehicleType,
        insurance_company: formData.insuranceCompany,
        vehicle_capacity: formData.vehicleCapacity,
        plate_number: formData.plateNumber,
        vehicle_model: formData.vehicleModel,
      });
      
      if (response.success) {
        // Store completion status
        await SecureStore.setItemAsync('profileComplete', 'true');
        await SecureStore.setItemAsync('userRole', 'courier');
        
        // Store verification results
        if (verification.plateVerification) {
          await SecureStore.setItemAsync('vehicleCountry', verification.plateVerification.country);
        }
        
        // Navigate to Courier tabs
        router.replace('/(app)/(courier_tabs)');
      } else {
        Alert.alert('Profile Error', response.message || 'Failed to complete vehicle profile');
      }
    } catch (error) {
      console.error('Vehicle info error:', error);
      Alert.alert('Error', 'An error occurred while saving your vehicle information');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (key: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const isFormValid = formData.vehicleType && formData.drivingLicense && formData.plateNumber &&
    (!verification.plateVerification || verification.plateVerification.isValid) &&
    (!verification.licenseVerification || verification.licenseVerification.isValid);

  const renderVerificationIcon = (verification: VehicleVerificationResult | LicenseVerificationResult | null, isLoading: boolean) => {
    if (isLoading) {
      return <ActivityIndicator size="small" color={Colors.light.primary} style={styles.verificationIcon} />;
    }
    
    if (!verification) return null;
    
    if (verification.isValid) {
      return <CheckCircle size={20} color={Colors.light.success} style={styles.verificationIcon} />;
    } else {
      return <AlertCircle size={20} color={Colors.light.error} style={styles.verificationIcon} />;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Vehicle Information</Text>
          <Text style={styles.subtitle}>Tell us about your vehicle</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Vehicle Type *"
            placeholderTextColor={Colors.light.placeholder}
            value={formData.vehicleType}
            onChangeText={(text) => updateFormData('vehicleType', text)}
            
          />
          <View style={styles.inputDivider} />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Vehicle Model *"
            placeholderTextColor={Colors.light.placeholder}
            value={formData.vehicleModel}
            onChangeText={(text) => updateFormData('vehicleModel', text)}
          />
          <View style={styles.inputDivider} />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="License Plate Number * (e.g., KCA 123A)"
            placeholderTextColor={Colors.light.placeholder}
            value={formData.plateNumber}
            onChangeText={(text) => {
              updateFormData('plateNumber', text);
              // Debounce verification
              setTimeout(() => handlePlateVerification(text), 500);
            }}
            autoCapitalize="characters"
          />
          {renderVerificationIcon(verification.plateVerification, verification.isVerifyingPlate)}
          <View style={styles.inputDivider} />
          
          {verification.plateVerification && !verification.plateVerification.isValid && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {verification.plateVerification.errors?.[0] || 'Invalid number plate format'}
              </Text>
              {verification.plateVerification.suggestions && verification.plateVerification.suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsTitle}>Did you mean:</Text>
                  {verification.plateVerification.suggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionButton}
                      onPress={() => updateFormData('plateNumber', suggestion)}
                    >
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
          
          {verification.plateVerification && verification.plateVerification.isValid && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>
                ✓ Valid {verification.plateVerification.country} number plate
              </Text>
            </View>
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Driving License Number * (e.g., DL123456789)"
            placeholderTextColor={Colors.light.placeholder}
            value={formData.drivingLicense}
            onChangeText={(text) => {
              updateFormData('drivingLicense', text);
              // Debounce verification
              setTimeout(() => handleLicenseVerification(text), 500);
            }}
          />
          {renderVerificationIcon(verification.licenseVerification, verification.isVerifyingLicense)}
          <View style={styles.inputDivider} />
          
          {verification.licenseVerification && !verification.licenseVerification.isValid && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {verification.licenseVerification.errors?.[0] || 'Invalid driving license format'}
              </Text>
            </View>
          )}
          
          {verification.licenseVerification && verification.licenseVerification.isValid && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>
                ✓ Valid {verification.licenseVerification.country} driving license
              </Text>
              {verification.licenseVerification.expiryDate && (
                <Text style={styles.infoText}>
                  Expires: {verification.licenseVerification.expiryDate}
                </Text>
              )}
              {verification.licenseVerification.restrictions && verification.licenseVerification.restrictions.length > 0 && (
                <Text style={styles.warningText}>
                  ⚠️ {verification.licenseVerification.restrictions[0]}
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Vehicle Capacity (kg) "
            placeholderTextColor={Colors.light.placeholder}
            keyboardType="numeric"
            value={formData.vehicleCapacity}
            onChangeText={(text) => updateFormData('vehicleCapacity', text)}
          />
          <View style={styles.inputDivider} />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Vehicle Insurance Company (Optional)"
            placeholderTextColor={Colors.light.placeholder}
            value={formData.insuranceCompany}
            onChangeText={(text) => {
              updateFormData('insuranceCompany', text);
            }}
            onBlur={handleInsuranceVerification}
          />
          {verification.isVerifyingInsurance && (
            <ActivityIndicator size="small" color={Colors.light.primary} style={styles.verificationIcon} />
          )}
          <View style={styles.inputDivider} />
        </View>

        {/* Verification Info Panel */}
        <View style={styles.infoPanel}>
          <View style={styles.infoPanelHeader}>
            <Info size={16} color={Colors.light.primary} />
            <Text style={styles.infoPanelTitle}>Supported Formats</Text>
          </View>
          <Text style={styles.infoPanelText}>
            • Kenya: KCA 123A (License: DL123456789){'\n'}
            • Uganda: UAH 123B (License: UG12345678){'\n'}
            • Tanzania: T 123 ABC (License: TZ12345678){'\n'}
            • Rwanda: RAB 123C (License: RW12345678)
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Complete Registration"
            onPress={handleContinue}
            disabled={!isFormValid || isLoading || verification.isVerifyingPlate || verification.isVerifyingLicense}
            loading={isLoading}
          />
        </View>
        
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sign in here</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.xxl,
    color: Colors.light.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: Colors.light.placeholder,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  input: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    paddingVertical: SPACING.md,
  },
  inputDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
    position: 'relative',
  },
  verificationIcon: {
    position: 'absolute',
    right: SPACING.md,
    top: SPACING.md,
  },
  errorContainer: {
    marginTop: SPACING.xs,
    padding: SPACING.sm,
    backgroundColor: `${Colors.light.error}10`,
    borderRadius: SPACING.xs,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.error,
  },
  errorText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.error,
  },
  successContainer: {
    marginTop: SPACING.xs,
    padding: SPACING.sm,
    backgroundColor: `${Colors.light.success}10`,
    borderRadius: SPACING.xs,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.success,
  },
  successText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.success,
  },
  infoText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.placeholder,
    marginTop: 2,
  },
  warningText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.warning,
    marginTop: 2,
  },
  suggestionsContainer: {
    marginTop: SPACING.xs,
  },
  suggestionsTitle: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.placeholder,
    marginBottom: SPACING.xs,
  },
  suggestionButton: {
    backgroundColor: Colors.light.background,
    padding: SPACING.xs,
    borderRadius: SPACING.xs,
    marginBottom: 2,
  },
  suggestionText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.primary,
  },
  infoPanel: {
    backgroundColor: `${Colors.light.primary}10`,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  infoPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  infoPanelTitle: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.primary,
    marginLeft: SPACING.xs,
  },
  infoPanelText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.text,
    lineHeight: 16,
  },
  buttonContainer: {
    marginTop: SPACING.xl,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
  },
  footerLink: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.primary,
    marginLeft: SPACING.xs,
  },
});