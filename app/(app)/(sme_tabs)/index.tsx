import { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, ScrollView, 
  Dimensions, PanResponder, Animated, Platform, Keyboard, KeyboardAvoidingView,
  TouchableWithoutFeedback, Modal, ActivityIndicator
} from 'react-native';
import { Chip, Checkbox } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import { MapPin, Package, Shield, Clock, ArrowRight, CreditCard, Calendar } from 'lucide-react-native';
import LottieView from 'lottie-react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import * as Location from 'expo-location';
import { useDelivery } from '@/contexts/DeliveryContext';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { createDeliveryRequest, computeDeliveryCharges, makePayment, DeliveryCharges } from '@/utils/deliveryApi';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const SNAP_POINTS = {
  COLLAPSED: screenHeight * 0.2,
  PARTIAL: screenHeight * 0.5,
  EXPANDED: screenHeight * 0.75,
  FULL: screenHeight * 0.9
};

interface DeliveryForm {
  qualities: any;
  weightType: string;
  pickupLocation: string;
  destinationLocation: string;
  packageDescription: string;
  packageWeight: string;
  courierCapacity: string;
  itemValue: string;
  vehicleType: string;
  valueRange: number;
  insurance: boolean;
}

export default function SMEHomeScreen() {
  const [destination, setDestination] = useState('');
  type Coordinates = {
    latitude: number;
    longitude: number;
    latitudeDelta: number,
    longitudeDelta: number,
  };

  const [location, setLocation] = useState<Coordinates | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0422,
    longitudeDelta: 0.0421,
  });
  const [userName] = useState('Maureen');
  const [expanded, setExpanded] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [insurance, setInsurance] = useState('');
  const [bottomSheetHeight, setBottomSheetHeight] = useState(SNAP_POINTS.COLLAPSED);
  
  // New states for payment flow
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isCalculatingCharges, setIsCalculatingCharges] = useState(false);
  const [deliveryCharges, setDeliveryCharges] = useState<DeliveryCharges | null>(null);
  const [createdDeliveryId, setCreatedDeliveryId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile_money' | 'bank_transfer'>('mobile_money');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Form field state
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
    insurance: false
  });

  const [errorMsg, setErrorMsg] = useState(''); 
  const qualities = ['Fragile', 'Heavy', 'Perishable', 'Urgent'];
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') console.log('Permission granted');
    };

    const getCurrentLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0422,
        longitudeDelta: 0.0421,
      });
    };

    getCurrentLocation();
    getPermissions();

    // Set up keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        snapToPosition(SNAP_POINTS.EXPANDED);
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Bottom sheet animation
  const bottomSheetAnim = useRef(new Animated.Value(SNAP_POINTS.COLLAPSED)).current;
  const panY = useRef(new Animated.Value(0)).current;

  // Function to snap bottom sheet to a specific position
  const snapToPosition = (position: number) => {
    setBottomSheetHeight(position);
    Animated.spring(bottomSheetAnim, {
      toValue: position,
      useNativeDriver: false,
      friction: 8,
      tension: 40
    }).start();
  };

  // Pan responder for bottom sheet dragging
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 10;
    },
    onPanResponderMove: (_, gestureState) => {
      const dy = gestureState.dy;
      if (
        bottomSheetHeight + dy >= SNAP_POINTS.COLLAPSED &&
        bottomSheetHeight + dy <= SNAP_POINTS.FULL
      ) {
        panY.setValue(dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      const currentHeight = bottomSheetHeight + gestureState.dy;
      let targetSnapPoint = SNAP_POINTS.PARTIAL;

      if (gestureState.vy > 0.5) {
        targetSnapPoint = SNAP_POINTS.COLLAPSED;
      } else if (gestureState.vy < -0.5) {
        targetSnapPoint = SNAP_POINTS.EXPANDED;
      } else if (currentHeight < (SNAP_POINTS.COLLAPSED + SNAP_POINTS.PARTIAL) / 2) {
        targetSnapPoint = SNAP_POINTS.COLLAPSED;
      } else if (currentHeight < (SNAP_POINTS.PARTIAL + SNAP_POINTS.EXPANDED) / 2) {
        targetSnapPoint = SNAP_POINTS.PARTIAL;
      } else {
        targetSnapPoint = SNAP_POINTS.EXPANDED;
      }

      setBottomSheetHeight(targetSnapPoint);

      Animated.parallel([
        Animated.spring(bottomSheetAnim, {
          toValue: targetSnapPoint,
          useNativeDriver: false,
          friction: 8,
          tension: 40,
        }),
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: false,
        }),
      ]).start();
    },
  });

  const handleContinue = () => {
    if (!expanded) {
      setExpanded(true);
      Animated.spring(bottomSheetAnim, {
        toValue: screenHeight * 0.7,
        useNativeDriver: false,
      }).start();
    } else {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        handleProceedToPayment();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setExpanded(false);
      setCurrentStep(1);
      Animated.spring(bottomSheetAnim, {
        toValue: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleProceedToPayment = async () => {
    setIsCalculatingCharges(true);
    
    try {
      // Step 1: Create delivery request
      const deliveryData = {
        ClientDetails: {
          smeName: 'TechCorp Solutions', // This should come from user context
          businessIndustry: 'Technology',
          smeId: 'sme_003', // This should come from user context
        },
        PackageDetails: {
          ...formData,
          price: 0, // Will be updated after charge calculation
        },
        pickupCord: {
          latitude: mapRegion.latitude,
          longitude: mapRegion.longitude,
          latitudeDelta: 0.0422,
          longitudeDelta: 0.0421,
        },
        dropoffCord: {
          latitude: mapRegion.latitude + 0.01,
          longitude: mapRegion.longitude + 0.01,
          latitudeDelta: 0.0422,
          longitudeDelta: 0.0421,
        },
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.destinationLocation,
        estimate: '0',
        status: 'pending',
      };

      const createdDelivery = await createDeliveryRequest(deliveryData);
      setCreatedDeliveryId(createdDelivery.id);

      // Step 2: Compute delivery charges
      const chargesInput = {
        packageWeight: formData.packageWeight,
        courierCapacity: formData.courierCapacity,
        insurance: formData.insurance,
        itemValue: formData.itemValue,
        valueRange: formData.valueRange,
        vehicleType: formData.vehicleType,
        pickupCord: deliveryData.pickupCord,
        dropoffCord: deliveryData.dropoffCord,
      };

      const charges = await computeDeliveryCharges(chargesInput);
      setDeliveryCharges(charges);
      
      setIsCalculatingCharges(false);
      setShowPaymentModal(true);
      
    } catch (error) {
      console.error('Error in payment flow:', error);
      setIsCalculatingCharges(false);
      setErrorMsg('Failed to process delivery request. Please try again.');
    }
  };

  const handlePayNow = async () => {
    if (!deliveryCharges || !createdDeliveryId) return;
    
    setIsProcessingPayment(true);
    
    try {
      const paymentData = {
        deliveryRequestId: createdDeliveryId,
        amount: deliveryCharges.charges,
        method: paymentMethod,
        smeId: 'sme_003', // This should come from user context
      };

      const paymentResult = await makePayment(paymentData);
      
      if (paymentResult.success) {
        // Reset form and close modals
        resetForm();
        setShowPaymentModal(false);
        // Show success message or navigate to deliveries screen
        alert('Payment successful! Your delivery request has been submitted.');
      } else {
        setErrorMsg('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMsg('Payment processing failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePayLater = () => {
    // Reset form and close modals
    resetForm();
    setShowPaymentModal(false);
    alert('Delivery request submitted! You can pay when the courier arrives.');
  };

  const resetForm = () => {
    setFormData({
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
      insurance: false
    });
    setInsurance('');
    setExpanded(false);
    setCurrentStep(1);
    setDeliveryCharges(null);
    setCreatedDeliveryId(null);
    snapToPosition(SNAP_POINTS.COLLAPSED);
  };

  const updateFormData = (key: keyof DeliveryForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleQuality = (quality: string) => {
    const newQualities = formData.qualities.includes(quality)
      ? formData.qualities.filter((q: string) => q !== quality)
      : [...formData.qualities, quality];
    updateFormData('qualities', newQualities);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
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
                onValueChange={(value: string) => setFormData(d => ({ ...d, weightType: value }))}>
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
            status={formData.insurance === true ? 'checked' : 'unchecked'}
            onPress={() => setFormData(d => ({ ...d, insurance: true }))}
          />
          <Checkbox.Item
            label="No, do not insure my goods"
            status={formData.insurance === false ? 'checked' : 'unchecked'}
            onPress={() => setFormData(d => ({ ...d, insurance: false }))}
          />
          <Text style={styles.insuranceNote}>
            Read terms and conditions for our insurance coverage.
          </Text>
        </>;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.destinationLocation.length > 0 && formData.pickupLocation.length > 0;
      case 2:
        return formData.packageDescription.length > 0 && formData.packageWeight.length > 0;
      case 3:
        return formData.vehicleType.length > 0;
      default:
        return false;
    }
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {mapRegion ? 
          <MapView
            style={[styles.map]}
            region={mapRegion}
            onRegionChangeComplete={setMapRegion}
          /> :
          <View>
            <MapView
              style={[styles.map]}
              region={{
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              onRegionChangeComplete={setMapRegion}
            />
            <Text style={styles.stepTitle}>
              Please select a destination on the map.
            </Text>
          </View>
        }

        {/* Loading Modal for Charge Calculation */}
        <Modal
          visible={isCalculatingCharges}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <LottieView
                source={{ uri: 'https://lottie.host/66ff6de2-394e-4010-8064-1d884167dbf6/do1Etdp721.json' }}
                autoPlay
                loop
                style={styles.loadingAnimation}
              />
              <Text style={styles.loadingText}>Calculating the best delivery price for you...</Text>
            </View>
          </View>
        </Modal>

        {/* Payment Modal */}
        <Modal
          visible={showPaymentModal}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.paymentOverlay}>
            <View style={styles.paymentContainer}>
              <Text style={styles.paymentTitle}>Delivery Charges</Text>
              
              {deliveryCharges && (
                <View style={styles.chargesBreakdown}>
                  <View style={styles.chargeRow}>
                    <Text style={styles.chargeLabel}>Base Price:</Text>
                    <Text style={styles.chargeValue}>KSh {deliveryCharges.breakdown.basePrice}</Text>
                  </View>
                  <View style={styles.chargeRow}>
                    <Text style={styles.chargeLabel}>Distance Charge:</Text>
                    <Text style={styles.chargeValue}>KSh {deliveryCharges.breakdown.distanceCharge}</Text>
                  </View>
                  <View style={styles.chargeRow}>
                    <Text style={styles.chargeLabel}>Weight Charge:</Text>
                    <Text style={styles.chargeValue}>KSh {deliveryCharges.breakdown.weightCharge}</Text>
                  </View>
                  {deliveryCharges.breakdown.insuranceCharge > 0 && (
                    <View style={styles.chargeRow}>
                      <Text style={styles.chargeLabel}>Insurance:</Text>
                      <Text style={styles.chargeValue}>KSh {deliveryCharges.breakdown.insuranceCharge}</Text>
                    </View>
                  )}
                  <View style={styles.chargeRow}>
                    <Text style={styles.chargeLabel}>Vehicle Premium:</Text>
                    <Text style={styles.chargeValue}>KSh {deliveryCharges.breakdown.premiumCharge}</Text>
                  </View>
                  <View style={[styles.chargeRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalValue}>KSh {deliveryCharges.charges}</Text>
                  </View>
                </View>
              )}

              <Text style={styles.paymentMethodTitle}>Payment Method</Text>
              <View style={styles.paymentMethods}>
                {[
                  { id: 'mobile_money', label: 'Mobile Money', icon: 'phone' },
                  { id: 'card', label: 'Credit/Debit Card', icon: 'credit-card' },
                  { id: 'bank_transfer', label: 'Bank Transfer', icon: 'bank' }
                ].map(method => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentMethod,
                      paymentMethod === method.id && styles.paymentMethodActive
                    ]}
                    onPress={() => setPaymentMethod(method.id as any)}
                  >
                    <MaterialCommunityIcons
                      name={method.icon as any}
                      size={24}
                      color={paymentMethod === method.id ? Colors.light.primary : Colors.light.placeholder}
                    />
                    <Text style={[
                      styles.paymentMethodText,
                      paymentMethod === method.id && styles.paymentMethodTextActive
                    ]}>
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.paymentButtons}>
                <TouchableOpacity
                  style={[styles.paymentButton, styles.payNowButton]}
                  onPress={handlePayNow}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <ActivityIndicator size="small" color={Colors.light.background} />
                  ) : (
                    <>
                      <CreditCard size={20} color={Colors.light.background} />
                      <Text style={styles.payNowText}>Pay Now</Text>
                    </>
                  )}
                </TouchableOpacity>
                
                {deliveryCharges?.delayPayment && (
                  <TouchableOpacity
                    style={[styles.paymentButton, styles.payLaterButton]}
                    onPress={handlePayLater}
                    disabled={isProcessingPayment}
                  >
                    <Calendar size={20} color={Colors.light.primary} />
                    <Text style={styles.payLaterText}>Pay Later</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPaymentModal(false)}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              height: bottomSheetAnim,
              transform: [{ translateY: panY }],
              zIndex: 1, 
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          <ScrollView 
            ref={scrollViewRef}
            style={styles.bottomSheetContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={keyboardVisible && { paddingBottom: 200 }}
          >
            {renderStepContent()}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {expanded && currentStep > 1 && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  !isStepValid() && styles.continueButtonDisabled,
                  expanded && currentStep > 1 && styles.continueButtonHalf
                ]}
                onPress={handleContinue}
                disabled={!isStepValid()}
              >
                <Text style={styles.continueButtonText}>
                  {currentStep === 3 ? 'Proceed to Payment' : 'Continue'}
                </Text>
                <ArrowRight size={20} color={Colors.light.background} />
              </TouchableOpacity>
            </View>

            {/* Step Indicator */}
            {expanded && (
              <View style={styles.stepIndicator}>
                {[1, 2, 3].map((step) => (
                  <View
                    key={step}
                    style={[
                      styles.stepDot,
                      step <= currentStep && styles.stepDotActive
                    ]}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapReduced: {
    height: '40%',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    ...SHADOWS.heavy,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
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
  stepTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.lg,
    color: Colors.light.text,
    marginBottom: SPACING.md,
  },
  autocompleteContainer: {
    zIndex: 1000,
    width: '100%',
    marginTop: SPACING.md,
  },
  input: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    backgroundColor: Colors.light.card,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  inputContainer: { 
    flexDirection: 'row',
    alignItems: 'center', 
    marginBottom: 12 
  },
  inputIcon: { 
    marginRight: 8 
  },
  qualitiesContainer: {
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8 
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
  insuranceNote: { fontSize: 12, color: '#555', marginTop: 8 },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    marginBottom: SPACING.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    gap: 6,
    padding: 15
  },
  chip: {
    backgroundColor: '#f3f3f3',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 15,
  },
  chipActive: {
    borderColor: Colors.light.primary
  },
  chipText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
  },
  chipTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  dropdown: {
    height: 50,
    width: '100%',
  },
  link: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.primary,
    textDecorationLine: 'underline',
    marginTop: SPACING.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  backButton: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  backButtonText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
  },
  continueButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  continueButtonHalf: {
    flex: 1,
  },
  continueButtonDisabled: {
    backgroundColor: Colors.light.disabled,
  },
  continueButtonText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.background,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.border,
  },
  stepDotActive: {
    backgroundColor: Colors.light.primary,
  },
  // Loading Modal Styles
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    maxWidth: '80%',
  },
  loadingAnimation: {
    width: 120,
    height: 120,
  },
  loadingText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  // Payment Modal Styles
  paymentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    maxWidth: '90%',
    maxHeight: '80%',
  },
  paymentTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.xl,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  chargesBreakdown: {
    marginBottom: SPACING.lg,
  },
  chargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  chargeLabel: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
  },
  chargeValue: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  totalLabel: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.lg,
    color: Colors.light.text,
  },
  totalValue: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.lg,
    color: Colors.light.primary,
  },
  paymentMethodTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    marginBottom: SPACING.md,
  },
  paymentMethods: {
    marginBottom: SPACING.lg,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: SPACING.sm,
  },
  paymentMethodActive: {
    borderColor: Colors.light.primary,
    backgroundColor: `${Colors.light.primary}10`,
  },
  paymentMethodText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    marginLeft: SPACING.md,
  },
  paymentMethodTextActive: {
    color: Colors.light.primary,
  },
  paymentButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  paymentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  payNowButton: {
    backgroundColor: Colors.light.primary,
  },
  payLaterButton: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  payNowText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.background,
  },
  payLaterText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.primary,
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  closeButtonText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.placeholder,
  },
});