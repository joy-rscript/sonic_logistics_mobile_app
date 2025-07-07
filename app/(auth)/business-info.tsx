import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { Button } from '@/components/ui/Button';

interface FormData {
  businessName: string;
  businessAddress: string;
  taxId: string;
  phoneNumber: string;
  website: string;
  industry: string;
}

export default function BusinessInfoScreen() {
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    businessAddress: '',
    taxId: '',
    phoneNumber: '',
    website: '',
    industry: '',
  });

  const handleContinue = () => {
    // Navigate to SME tabs after completing business info
    router.replace('/(app)/(sme_tabs)');
  };

  const updateFormData = (key: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const isFormValid = formData.businessName && formData.businessAddress && formData.industry;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Business Information</Text>
          <Text style={styles.subtitle}>Tell us about your business</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Business Name *"
            placeholderTextColor={Colors.light.placeholder}
            value={formData.businessName}
            onChangeText={(text) => updateFormData('businessName', text)}
          />
          <View style={styles.inputDivider} />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Business Address *"
            placeholderTextColor={Colors.light.placeholder}
            value={formData.businessAddress}
            onChangeText={(text) => updateFormData('businessAddress', text)}
            multiline
          />
          <View style={styles.inputDivider} />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Tax ID (Optional)"
            placeholderTextColor={Colors.light.placeholder}
            value={formData.taxId}
            onChangeText={(text) => updateFormData('taxId', text)}
          />
          <View style={styles.inputDivider} />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Business Phone Number"
            placeholderTextColor={Colors.light.placeholder}
            keyboardType="phone-pad"
            value={formData.phoneNumber}
            onChangeText={(text) => updateFormData('phoneNumber', text)}
          />
          <View style={styles.inputDivider} />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Business Website (Optional)"
            placeholderTextColor={Colors.light.placeholder}
            keyboardType="url"
            autoCapitalize="none"
            value={formData.website}
            onChangeText={(text) => updateFormData('website', text)}
          />
          <View style={styles.inputDivider} />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Business Industry *"
            placeholderTextColor={Colors.light.placeholder}
            value={formData.industry}
            onChangeText={(text) => updateFormData('industry', text)}
          />
          <View style={styles.inputDivider} />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Complete Registration"
            onPress={handleContinue}
            disabled={!isFormValid}
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