import { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { MapPin, Package, Calendar } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface DeliveryForm {
  pickupAddress: string;
  deliveryAddress: string;
  packageDescription: string;
  packageWeight: string;
  packageValue: string;
  deliveryDate: string;
  specialInstructions: string;
}

export default function CreateDeliveryScreen() {
  const [formData, setFormData] = useState<DeliveryForm>({
    pickupAddress: '',
    deliveryAddress: '',
    packageDescription: '',
    packageWeight: '',
    packageValue: '',
    deliveryDate: '',
    specialInstructions: '',
  });

  const updateFormData = (key: keyof DeliveryForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCreateDelivery = () => {
    // Handle Delivery creation logic
    console.log('Creating Delivery:', formData);
  };

  const isFormValid = formData.pickupAddress && formData.deliveryAddress && formData.packageDescription;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Delivery</Text>
        <Text style={styles.headerSubtitle}>Fill in the details below</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={Colors.light.primary} />
            <Text style={styles.sectionTitle}>Pickup & Delivery</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Pickup Address"
              placeholderTextColor={Colors.light.placeholder}
              value={formData.pickupAddress}
              onChangeText={(text) => updateFormData('pickupAddress', text)}
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Delivery Address"
              placeholderTextColor={Colors.light.placeholder}
              value={formData.deliveryAddress}
              onChangeText={(text) => updateFormData('deliveryAddress', text)}
              multiline
            />
          </View>
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package size={20} color={Colors.light.primary} />
            <Text style={styles.sectionTitle}>Package Details</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Package Description"
              placeholderTextColor={Colors.light.placeholder}
              value={formData.packageDescription}
              onChangeText={(text) => updateFormData('packageDescription', text)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <TextInput
                style={styles.input}
                placeholder="Weight (kg)"
                placeholderTextColor={Colors.light.placeholder}
                keyboardType="numeric"
                value={formData.packageWeight}
                onChangeText={(text) => updateFormData('packageWeight', text)}
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <TextInput
                style={styles.input}
                placeholder="Value (KSh)"
                placeholderTextColor={Colors.light.placeholder}
                keyboardType="numeric"
                value={formData.packageValue}
                onChangeText={(text) => updateFormData('packageValue', text)}
              />
            </View>
          </View>
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={Colors.light.primary} />
            <Text style={styles.sectionTitle}>Delivery Preferences</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Preferred Delivery Date"
              placeholderTextColor={Colors.light.placeholder}
              value={formData.deliveryDate}
              onChangeText={(text) => updateFormData('deliveryDate', text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Special Instructions (Optional)"
              placeholderTextColor={Colors.light.placeholder}
              value={formData.specialInstructions}
              onChangeText={(text) => updateFormData('specialInstructions', text)}
              multiline
              numberOfLines={3}
            />
          </View>
        </Card>

        <Button
          title="Create Delivery"
          onPress={handleCreateDelivery}
          disabled={!isFormValid}
          style={styles.createButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.xl,
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: Colors.light.placeholder,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    marginLeft: SPACING.sm,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  input: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: Colors.light.background,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  createButton: {
    marginTop: SPACING.md,
  },
});