import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { TextInput, Chip } from "react-native-paper";
import PhoneInput, { PhoneInputProps } from 'react-native-phone-number-input';
import { Button } from "@/components/ui/Button";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import { SPACING, FONT_SIZE, BORDER_RADIUS } from "@/constants/Theme";

interface FormData {
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
}

interface FormErrors {
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
}

const RegisterScreen = () => {
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    role: "",
    phone: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    firstName: "",
    lastName: "",
    phone: "",
    role: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [formattedPhone, setFormattedPhone] = useState("");
  const [countryCode, setCountryCode] = useState("UG");
  const PhoneInputComponent = PhoneInput as unknown as React.ComponentType<PhoneInputProps>;
  const phoneInput = useRef<any>(null);
  const router = useRouter();

  const validateForm = () => {
    let isValid = true;
    const newErrors: FormErrors = {
      firstName: "",
      lastName: "",
      phone: "",
      role: "",
    };

    if (!form.firstName.trim()) {
      newErrors.firstName = "First name is required";
      isValid = false;
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!phoneInput.current?.isValidNumber(form.phone)) {
      newErrors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    if (!form.role) {
      newErrors.role = "Please select a role";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const store = async (data: FormData) => {
    try {
      for (const [key, value] of Object.entries(data)) {
        await SecureStore.setItemAsync(key, value.toString());
      }
    } catch (error) {
      console.error("SecureStore error:", error);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePhoneChange = (text: string) => {
    setForm((prev) => ({ ...prev, phone: text }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Format the phone number with country code
      const formattedNumber = phoneInput.current?.getNumberAfterPossiblyEliminatingZero();
      
      if (formattedNumber) {
        const dataToStore = {
          ...form,
          phone: formattedNumber.formattedNumber || form.phone,
        };
        
        await store(dataToStore);
        // router.push("/(auth)/otp-verification");
      router.replace("/(app)/(sme_tabs)" as any);     //app/(app)/(sme_tabs)/index.tsx 
}
      console.log("Registration successful");
    } catch (err) {
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Create Account</Text>
      
      <TextInput
        label="First Name"
        value={form.firstName}
        onChangeText={(val) => handleChange("firstName", val)}
        style={styles.input}
        mode="flat"
        outlineColor={Colors.light.border}
        activeOutlineColor={Colors.light.primary}
        error={!!errors.firstName}
      />
      {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
      
      <TextInput
        label="Last Name"
        value={form.lastName}
        onChangeText={(val) => handleChange("lastName", val)}
        style={styles.input}
        mode="flat"
        outlineColor={Colors.light.border}
        activeOutlineColor={Colors.light.primary}
        error={!!errors.lastName}
      />
      {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
      
      <Text style={styles.label}>Phone Number</Text>
      <PhoneInput       
        ref={phoneInput}
        defaultValue={form.phone}
        defaultCode={countryCode as any}
        layout="first"
        onChangeText={handlePhoneChange}
        onChangeFormattedText={(text) => setFormattedPhone(text)}
        containerStyle={styles.phoneContainer}
        textContainerStyle={styles.phoneTextContainer}
        textInputStyle={styles.phoneInput}
        codeTextStyle={styles.codeText}
        countryPickerButtonStyle={styles.countryButton}
        renderDropdownImage={() => (
          <Text style={styles.dropdownIcon}>▼</Text>
        )}
        filterProps={{
          placeholder: "Search country",
        }}
        disableArrowIcon
        autoFocus={false}
      />
      {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}

      <Text style={styles.label}>Select Role</Text>
      <View style={styles.chipContainer}>
        <Chip
          mode="outlined"
          style={[styles.chip, form.role === "courier" && styles.chipActive]}
          textStyle={[styles.chipText, form.role === "courier" && styles.chipTextActive]}
          selected={form.role === "courier"}
          onPress={() => handleChange("role", "courier")}
          selectedColor={Colors.light.primary}
        >
          Courier
        </Chip>
        <Chip
          mode="outlined"
          style={[styles.chip, form.role === "sme" && styles.chipActive]}
          textStyle={[styles.chipText, form.role === "sme" && styles.chipTextActive]}
          selected={form.role === "sme"}
          onPress={() => handleChange("role", "sme")}
          selectedColor={Colors.light.primary}
        >
          SME
        </Chip>
      </View>
      {errors.role ? <Text style={styles.errorText}>{errors.role}</Text> : null}

      <Button
        title="Continue"
        onPress={handleSignUp}
        variant="primary"
        loading={isLoading}
        style={styles.button}
      />

      <TouchableOpacity onPress={() => router.push("/login")} style={styles.linkContainer}>
        <Text style={styles.linkText}>
          Already have an account?{" "}
          <Text style={styles.link}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: "700",
    marginBottom: SPACING.xl,
    textAlign: "center",
    color: Colors.light.text,
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: Colors.light.background,
  },
  label: {
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
    fontWeight: "500",
    color: Colors.light.text,
    fontSize: FONT_SIZE.md,
  },
  phoneContainer: {
    width: "100%",
    height: 60,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  phoneTextContainer: {
    backgroundColor: Colors.light.background,
    paddingVertical: 0,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  phoneInput: {
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    height: 50,
  },
  codeText: {
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
  },
  countryButton: {
    borderRightWidth: 1,
    borderRightColor: Colors.light.border,
  },
  dropdownIcon: {
    fontSize: 10,
    color: Colors.light.placeholder,
    marginLeft: 4,
  },
  chipContainer: {
    flexDirection: "row",
    marginBottom: SPACING.md,
  },
  chip: {
    marginRight: SPACING.md,
    backgroundColor: Colors.light.background,
    borderColor: Colors.light.border,
  },
  chipText: {
    color: Colors.light.text,
  },
  chipActive: {
    backgroundColor: "#FFFFFF",
    borderColor: Colors.light.primary,
  },
  chipTextActive: {
    color: Colors.light.primary,
    fontWeight: "600",
  },
  button: {
    marginTop: SPACING.lg,
  },
  linkContainer: {
    marginTop: SPACING.lg,
    alignItems: "center",
  },
  linkText: {
    fontSize: FONT_SIZE.md,
    color: Colors.light.placeholder,
  },
  link: {
    color: Colors.light.primary,
    fontWeight: "600",
  },
  errorText: {
    color: Colors.light.error,
    fontSize: FONT_SIZE.xs,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
});