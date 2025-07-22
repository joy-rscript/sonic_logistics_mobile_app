import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Link, router } from 'expo-router';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { Button } from '@/components/ui/Button';

interface FormData {
  password: string;
  confirmPassword: string;
}

export default function PasswordScreen() {
  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: '',
  });

  const handleContinue = () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    
    if (!passwordRegex.test(formData.password)) {
      alert('Password does not meet requirements');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }


    const userRole = 'sme'; 
    
    if (userRole === 'sme') {
      router.push('/(auth)/business-info');
    } else {
      router.push('/(auth)/vehicle-info');
    }
  };

  const updateFormData = (key: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const isFormValid = formData.password && formData.confirmPassword;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/illustrations/Tiny_people_carrying_key_to_open_padlock.jpg')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Create Password</Text>
          <Text style={styles.subtitle}>Choose a secure password for your account</Text>
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            label="Password"
            mode="flat"
            outlineColor={Colors.light.border}
            activeOutlineColor={Colors.light.primary}
            secureTextEntry
            value={formData.password}
            onChangeText={(text) => updateFormData('password', text)}
            style={styles.input}
          />
          <View style={styles.inputDivider} />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            mode="flat"
            outlineColor={Colors.light.border}
            activeOutlineColor={Colors.light.primary}
            placeholder="Confirm Password"
            placeholderTextColor={Colors.light.placeholder}
            secureTextEntry
            value={formData.confirmPassword}
            onChangeText={(text) => updateFormData('confirmPassword', text)}
            style={styles.input}
          />
          <View style={styles.inputDivider} />
        </View>

       

        <View style={styles.buttonContainer}>
          <Button
            title="Continue"
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: SPACING.md,
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
  passwordRequirements: {
    backgroundColor: Colors.light.card,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xl,
  },
  requirementsTitle: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
    marginBottom: SPACING.xs,
  },
  requirement: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.placeholder,
    marginBottom: 2,
  },
  buttonContainer: {
    marginTop: SPACING.md,
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