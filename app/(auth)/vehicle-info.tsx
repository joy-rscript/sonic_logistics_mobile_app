import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import Colors from import { CircleCheck as CheckCircle, CircleAlert as AlertCircle, Info } from 'lucide-react-native'nstants/Theme';
import { Button } from '@/components/ui/Button';
import { courierOnboarding } from '@/utils/authApi';

interface FormData {
  vehicleType: string;
  drivingLicense: string;
  vehicleCapacity: string;
  insuranceCompany: string;
  plateNumber: string;
  vehicleModel: string;
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

  const handleContinue = async () => {
    if (isLoading) return;
    
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

  const isFormValid = formData.vehicleType && formData.drivingLicense && formData.plateNumber;

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
            placeholder="License Plate Number *"
            placeholderTextColor={Colors.light.placeholder}
            value={formData.plateNumber}
            onChangeText={(text) => updateFormData('plateNumber', text)}
            autoCapitalize="characters"
            
          />
          <View style={styles.inputDivider} />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Driving License Number *"
            placeholderTextColor={Colors.light.placeholder}
            value={formData.drivingLicense}
            onChangeText={(text) => updateFormData('drivingLicense', text)}
          />
          <View style={styles.inputDivider} />
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
            placeholder="Vehicle Insurance Company"
            placeholderTextColor={Colors.light.placeholder}
            value={formData.insuranceCompany}
            onChangeText={(text) => updateFormData('insuranceCompany', text)}
          />
          <View style={styles.inputDivider} />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Complete Registration"
            onPress={handleContinue}
            disabled={!isFormValid || isLoading}
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