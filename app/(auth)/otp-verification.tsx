import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Animated,
  Keyboard,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import * as SecureStore from "expo-secure-store";
import Colors from "@/constants/Colors";
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS } from "@/constants/Theme";
import { verifyCode, resendOTP } from "@/utils/authApi";

export default function OTPVerificationScreen() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("");
  
  // Animation value for the verification indicator
  const verifyingAnimation = useRef(new Animated.Value(0)).current;
  
  // Create refs for each input field
  const inputRefs = useRef<Array<TextInput | null>>([]);
  
  // Set up the refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
    loadUserData();
  }, []);

  // Load user data from secure store
  const loadUserData = async () => {
    try {
      const phone = await SecureStore.getItemAsync('phone');
      const id = await SecureStore.getItemAsync('userId');
      const role = await SecureStore.getItemAsync('role');
      
      if (phone && id && role) {
        setUserPhone(phone);
        setUserId(id);
        setUserRole(role);
      } else {
        Alert.alert('Error', 'Registration data not found. Please register again.');
        router.replace('/(auth)/register');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load registration data.');
    }
  };
  // Timer countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Effect to check if OTP is complete and trigger verification
  useEffect(() => {
    const isComplete = otp.every((digit) => digit !== "");
    if (isComplete) {
      Keyboard.dismiss();
      handleVerify();
    }
  }, [otp]);

  // Handle OTP input change
  const handleOtpChange = (value: string, index: number) => {
    // Only accept numbers
    if (!/^\d*$/.test(value)) return;
    
    // Update the OTP array
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // If a value is entered, move to the next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace key press
  const handleKeyPress = (e: any, index: number) => {
    // Check if backspace is pressed and current field is empty
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      // Focus on the previous input
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle verification
  const handleVerify = async () => {
    if (isVerifying) return;
    
    const otpCode = otp.join("");
    if (otpCode.length !== 6) return;
    
    setIsVerifying(true);
    
    // Provide haptic feedback
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // Animate the verification indicator
    Animated.timing(verifyingAnimation, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    try {
      // Call verification API
      const response = await verifyCode({
        code: otpCode,
        userId: userId,
      });
      
      if (response.success) {
        // Store verification status
        await SecureStore.setItemAsync('isVerified', 'true');
        
        // Navigate to password screen
        setTimeout(() => {
          router.push("/(auth)/password");
        }, 1000);
      } else {
        // Reset OTP and show error
        setOtp(["", "", "", "", "", ""]);
        setIsVerifying(false);
        verifyingAnimation.setValue(0);
        Alert.alert('Verification Failed', response.message || 'Invalid code. Please try again.');
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Verification error:', error);
      setOtp(["", "", "", "", "", ""]);
      setIsVerifying(false);
      verifyingAnimation.setValue(0);
      Alert.alert('Verification Error', 'An error occurred. Please try again.');
      inputRefs.current[0]?.focus();
    }
  };

  // Handle resend OTP
  const handleResend = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      const response = await resendOTP(userPhone, userId);
      
      if (response.success) {
        setTimer(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        
        // Focus on the first input
        inputRefs.current[0]?.focus();
        
        Alert.alert('Code Sent', response.message || 'New verification code sent to your phone.');
      } else {
        Alert.alert('Resend Failed', response.message || 'Failed to resend code. Please try again.');
      }
    } catch (error) {
      console.error('Resend error:', error);
      Alert.alert('Resend Error', 'An error occurred. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verification Code</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to {userPhone}.{"\n"}
          Enter it below to continue.
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <View key={index} style={styles.inputWrapper}>
              <TextInput
                ref={(ref: TextInput | null) => {
                  inputRefs.current[index] = ref
                }}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                  isVerifying && styles.otpInputVerifying,
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
                autoFocus={index === 0}
                selectTextOnFocus
              />
            </View>
          ))}
        </View>

        {isVerifying && (
          <Animated.View
            style={[
              styles.verifyingIndicator,
              {
                opacity: verifyingAnimation,
                transform: [
                  {
                    translateY: verifyingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.verifyingText}>Verifying...</Text>
          </Animated.View>
        )}

        <View style={styles.timerContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend} style={styles.resendButton}>
              <Text style={styles.resendText}>Resend Code</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>
              Resend code in <Text style={styles.timerDigit}>{timer}s</Text>
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl * 2,
    alignItems: "center",
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: Colors.light.placeholder,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.xxl,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: SPACING.xl,
    width: "100%",
  },
  inputWrapper: {
    marginHorizontal: 6,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: BORDER_RADIUS.md,
    fontSize: FONT_SIZE.xl,
    fontWeight: "600",
    color: Colors.light.text,
    backgroundColor: "#FAFAFA",
  },
  otpInputFilled: {
    borderColor: Colors.light.primary,
    backgroundColor: "#FFF9EC",
  },
  otpInputVerifying: {
    borderColor: Colors.light.primary,
    backgroundColor: "#FFF9EC",
  },
  timerContainer: {
    marginTop: SPACING.md,
  },
  timerText: {
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
  },
  timerDigit: {
    fontWeight: "600",
    color: Colors.light.text,
  },
  resendButton: {
    padding: SPACING.sm,
  },
  resendText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
    color: Colors.light.primary,
  },
  verifyingIndicator: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  verifyingText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "500",
    color: Colors.light.primary,
  },
});