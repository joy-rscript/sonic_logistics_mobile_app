import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { StepIndicator } from '@/components/ui/StepIndicator';

import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  Animated, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ScrollView, Dimensions
} from 'react-native';
import MapView from 'react-native-maps';
import { Package, MapPin, ArrowLeft, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { Picker } from '@react-native-picker/picker'
import { Checkbox, Chip } from 'react-native-paper';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
              
              

const SNAP_COLLAPSED = 200;
const SNAP_EXPANDED = Dimensions.get('window').height * 0.7;

interface DeliveryForm {
  qualities: any;
  weightType: string;
  pickupLocation: string;
  destinationLocation: string;
  packageDescription: string;
  packageWeight: string;
  courierCapacity: string;
  itemValue: string;
  vehicleType:string,
  valueRange: number;
  insurance : boolean;
}
export default function HomeScreen() {
  const [mapRegion, setMapRegion] = useState({
    latitude: 0, longitude: 0,
    latitudeDelta: 0.005, longitudeDelta: 0.005,
  });
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showLoading, setShowLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [userName] = useState('Maureen');

  const [formData, setFormData] = useState<DeliveryForm>({
    pickupLocation: '', 
    destinationLocation: '',
    packageDescription: '', 
    packageWeight: '',
    courierCapacity: '', 
    itemValue: '',
    valueRange: 0,
    vehicleType: '',
    qualities: [],
    weightType: '',
    insurance : false
  });

  const bottomSheetAnim = useRef(new Animated.Value(SNAP_COLLAPSED)).current;

  // Get user location
  useEffect(() => {
    (async () => {
      const loc = await Location.getCurrentPositionAsync({});
      setMapRegion({
        latitude: loc.coords.latitude, longitude: loc.coords.longitude,
        latitudeDelta: 0.005, longitudeDelta: 0.005,
      });
    })();
  }, []);

  const openSheet = () => {
    setShowBottomSheet(true);
    Animated.spring(bottomSheetAnim, {
      toValue: SNAP_EXPANDED, useNativeDriver: false
    }).start();
  };

  const closeSheet = () => {
    Animated.spring(bottomSheetAnim, {
      toValue: SNAP_COLLAPSED, useNativeDriver: false
    }).start(() => {
      setShowBottomSheet(false);
      setCurrentStep(1);
    });
  };

  const handleContinue = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep < 4) setCurrentStep(s => s + 1);
    else handleCreateOrder();
  };

  const handleBack = () => {
    if (showPayment) {
      setShowPayment(false); setShowLoading(false); return;
    }
    if (currentStep > 1) setCurrentStep(s => s - 1);
    else closeSheet();
  };

  const handleCreateOrder = () => {
    setShowLoading(true);
    setTimeout(() => {
      setShowLoading(false);
      setShowPayment(true);
    }, 2000);
  };

  const handlePayment = (method: 'paystack' | 'mobile-money') => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // payment logic
    closeSheet();
    setShowPayment(false);
    setFormData({
      pickupLocation: '',
      destinationLocation: '',
      packageDescription: '',
      packageWeight: '',
      weightType: '',
      courierCapacity: '',
      itemValue: '',
      valueRange: 0,
      vehicleType: '',
      qualities: [],
      insurance: false
    });
  };

  const canContinue = () => {
    switch (currentStep) {
      case 1: return formData.pickupLocation && formData.destinationLocation;
      case 2: return formData.packageDescription && formData.packageWeight;
      case 3: return formData.courierCapacity && formData.itemValue;
      case 4: return true;
    }
    return false;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <>
          <Text style={styles.stepTitle}>Where are we picking up and delivering?</Text>
          {/* Pickup */}
          <View style={styles.inputContainer}>
            <MapPin size={20} color={Colors.light.primary} style={styles.inputIcon} />
            <TextInput
              placeholder="Pickup location" style={styles.input}
              value={formData.pickupLocation}
              onChangeText={t => setFormData(d => ({ ...d, pickupLocation: t }))}
            />
          </View>
          {/* Destination */}
          <View style={styles.inputContainer}>
            <MapPin size={20} color={Colors.light.primary} style={styles.inputIcon} />
            <TextInput
              placeholder="Destination location" style={styles.input}
              value={formData.destinationLocation}
              onChangeText={t => setFormData(d => ({ ...d, destinationLocation: t }))}
            />
          </View>
        </>;
      case 2:
        return <>
          <Text style={styles.stepTitle}>Tell us about your package</Text>
          <View style={styles.inputContainer}>
            <Package size={20} color={Colors.light.primary} style={styles.inputIcon} />
            <TextInput
              placeholder="Description" style={styles.input}
              value={formData.packageDescription}
              onChangeText={t => setFormData(d => ({ ...d, packageDescription: t }))}
            />
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.inputContainer}>
              <Picker
                selectedValue={formData.weightType}
                style={styles.dropdown}
                onValueChange={(value : string) => setFormData(d => ({ ...d, weightType: value }))}>
                <Picker.Item label="Weight" value="weight" />
                <Picker.Item label="Quantity" value="quantity" />
              </Picker>
            </View>
            <TextInput
              placeholder={formData.weightType === 'weight' ? "Weight (kg)" : "Quantity (e.g. 3)"}
              style={styles.input}
              keyboardType="numeric"
              value={formData.packageWeight}
              onChangeText={t => setFormData(d => ({ ...d, packageWeight: t }))}
            />
          </View>
          
          <Text style={styles.stepTitle}>Package Qualities</Text>
          <View style={styles.qualitiesContainer}>
            {[
              { id: 'fragile', label: 'Fragile' },
              { id: 'urgent', label: 'Urgent' },
              { id: 'coldchain', label: 'Cold Chain Required' },
              { id: 'not_waterproof', label: 'Moisture Sensitive' }
            ].map(quality => (
              <Chip
                key={quality.id}
                mode="outlined"
                style={[styles.chip, formData.qualities?.includes(quality.id) && styles.chipActive]}
                textStyle={[styles.chipText, formData.qualities?.includes(quality.id) && styles.chipTextActive]}
                selected={formData.qualities?.includes(quality.id)}
                onPress={() => {
                  const qualities = formData.qualities || [];
                  const newQualities = qualities.includes(quality.id)
                    ? qualities.filter((q: string) => q !== quality.id)
                    : [...qualities, quality.id];
                  setFormData(d => ({ ...d, qualities: newQualities }));
                }}
                selectedColor={Colors.light.primary}
              >
                {quality.label}
              </Chip>
            ))}
          </View>
            
                      <Text style={styles.stepTitle}>Value Range</Text>
                      <View style={styles.qualitiesContainer}>
                        {[
                          { id: 1, label: '30khs-100khs' },
                          { id: 2, label: '110khs-500khs' },
                          { id: 3, label: '510khs-1000khs' },
                          { id: 4, label: '1000khs+' }
                        ].map(range => (
                          <Chip
                            key={range.id}
                            mode="outlined"
                            style={[styles.chip, formData.valueRange === range.id && styles.chipActive]}
                            textStyle={[styles.chipText, formData.valueRange === range.id && styles.chipTextActive]}
                            selected={formData.valueRange === range.id}
                            onPress={() => setFormData(d => ({ ...d, valueRange: range.id }))}
                            selectedColor={Colors.light.primary}
                          >
                            {range.label}
                          </Chip>
                        ))}
                      </View>
                      <Text style={styles.insuranceNote}>
                      This info helps us recover costs if goods are insured.
                    </Text>
            
        </>;
      case 3:
        return <>
          <Text style={styles.stepTitle}>Select courier capacity</Text>
          <View style={styles.capacityContainer}>
            {[
              { id: '1', label: 'Bike', icon: 'bike' },
              { id: '2', label: 'Small Car', icon: 'car' },
              { id: '3', label: 'Medium Car', icon: 'car-estate' },
              { id: '4', label: 'Truck', icon: 'truck' }
            ].map(vehicle => (
              <TouchableOpacity
                key={vehicle.id}
                style={[
                  styles.vehicleOption,

                  formData.vehicleType === vehicle.id && styles.vehicleOptionActive
                ]}
                onPress={() => setFormData(d => ({ ...d, vehicleType: vehicle.id }))}
              >
                <MaterialIcons
                  name={vehicle.icon as keyof typeof MaterialIcons.glyphMap}
                  size={32}
                  color={formData.vehicleType === vehicle.id ? Colors.light.primary : Colors.light.text}
                />
                <Text style={[
                    styles.vehicleLabel,
                    formData.vehicleType === vehicle.id && styles.vehicleLabelActive
                  ]}>
                    {vehicle.label}
                </Text>
              </TouchableOpacity>

            ))}
          </View>
           <Text style={styles.stepTitle}>Add insurance?</Text>
                  <Checkbox.Item
                    label="Yes, insure my goods"
                    status={formData.insurance === true? 'checked' : 'unchecked'}
                    onPress={() =>     setFormData(d => ({ ...d, insurance: false }))
                            }                  />
                  <Checkbox.Item
                    label="No, do not insure my goods"
                    status={formData.insurance === false ? 'checked' : 'unchecked'}
                    onPress={() =>     setFormData(d => ({ ...d, insurance: true }))
}
                  />
                  <Text style={styles.insuranceNote}>
                    Read terms and conditions for our insurance coverage.
                  </Text>
          
          
        </>;
      case 4:
        return <>
          <Text style={styles.stepTitle}>Review your order</Text>
          {/* review card UI */}
        </>;
    }
  };

  if (showLoading) return (
    <View style={styles.loadingContainer}>
      <Package size={48} color={Colors.light.primary} />
      <Text style={styles.loadingText}>Calculating the cost for your convenience…</Text>
    </View>
  );

  if (showPayment) return (
    <View style={styles.paymentContainer}>
      <View style={styles.paymentHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.paymentTitle}>Payment</Text>
      </View>
      {/* Payment Card + Buttons */}
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <MapView style={styles.map} region={mapRegion} onRegionChangeComplete={setMapRegion} />
        <TouchableOpacity style={styles.newOrderButton} onPress={openSheet}>
          <Text style={styles.newOrderText}>
            Hey {userName}, start a new order delivery/request...
          </Text>
        </TouchableOpacity>

        {showBottomSheet && (
          <Animated.View style={[styles.bottomSheet, { height: bottomSheetAnim }]}>
            <View style={styles.dragHandle} />
            <StepIndicator currentStep={currentStep} totalSteps={4} stepTitles={[]} />
            <ScrollView contentContainerStyle={styles.sheetContent}>
              {renderStepContent()}
            </ScrollView>
            <View style={styles.sheetActions}>
              {currentStep > 1 && <Button title="Back" onPress={handleBack} variant="outline" />}
              <Button
                title={currentStep === 4 ? "Create Order" : "Continue"}
                onPress={handleContinue}
                disabled={!canContinue()}
              />
            </View>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
   map: { flex: 1 },
  newOrderButton: {
    position: 'absolute', top: 50, alignSelf: 'center',
    backgroundColor: Colors.light.primary, padding: 12,
    borderRadius: 8
  },
  newOrderText: { color: '#fff', fontSize: 16 },
  bottomSheet: {
    position: 'absolute', bottom: 0, width: '100%',
    backgroundColor: '#fff', borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  dragHandle: { height: 4, width: 40, backgroundColor: '#ccc', alignSelf: 'center', marginVertical: 8 },
  sheetContent: { padding: 16 },
  sheetActions: { flexDirection: 'row', justifyContent: 'space-between', margin: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, padding: 8,
  },
  textArea: { height: 80 },
  stepTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  insuranceNote: { fontSize: 12, color: '#555', marginTop: 8 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16 },
  paymentContainer: { flex: 1, padding: 16, backgroundColor: '#fff' },
  paymentHeader: { flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 16 },
  paymentTitle: { fontSize: 20, fontWeight: '600' },
  mapReduced: {
    height: '40%',
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  stepContainer: {
    paddingBottom: SPACING.lg,
  },
  greeting: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.lg,
    color: Colors.light.text,
    marginBottom: SPACING.lg,
  },
  autocompleteContainer: {
    zIndex: 1000,
    width: '100%',
    marginTop: SPACING.md,
  },
  content: {
    padding: SPACING.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: Colors.light.placeholder,
    marginBottom: SPACING.xl,
  },
  createDeliveryButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  createDeliveryText: {
    color: '#fff',
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  capacityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  vehicleOption: {
    width: '48%',
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  vehicleOptionActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  vehicleLabel: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
  },
  vehicleLabelActive: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  optionCard: {
    width: '47%',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  qualitiesContainer: {
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8 
  }
  ,
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
  selectedOption: {
    backgroundColor: '#FFF9EC',
    borderColor: Colors.light.primary,
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  optionLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: Colors.light.text,
  },
  selectedOptionText: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  valueOptionsContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  valueOption: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  selectedValueOption: {
    backgroundColor: '#FFF9EC',
    borderColor: Colors.light.primary,
  },
  valueOptionContent: {
    gap: SPACING.xs,
  },
  valueOptionLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: Colors.light.text,
  },
  valueOptionRange: {
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
  },
  selectedValueOptionText: {
    color: Colors.light.primary,
  },
  reviewCard: {
    gap: SPACING.md,
  },
  
  dropdown: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
  }
,
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reviewLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: Colors.light.placeholder,
    flex: 1,
  },
  reviewValue: {
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    flex: 2,
    textAlign: 'right',
  },
  bottomSheetActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  backActionButton: {
    flex: 1,
  },
  continueButton: {
    flex: 2,
  },

  paymentCard: {
    margin: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  paymentAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  paymentDescription: {
    fontSize: FONT_SIZE.md,
    color: Colors.light.placeholder,
    textAlign: 'center',
  },
  paymentMethods: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  paymentButton: {
    marginBottom: SPACING.sm,
  },
});