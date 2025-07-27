import { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, ScrollView, 
  Dimensions, PanResponder, Animated, Platform, Keyboard, KeyboardAvoidingView,
  TouchableWithoutFeedback
} from 'react-native';
import { Chip, Checkbox } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import { MapPin, Package, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';
import * as Location from 'expo-location';
import { useDelivery } from '@/contexts/DeliveryContext';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

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
  type Coordinates = {
    latitude: number;
    longitude: number;
    latitudeDelta: number,
    longitudeDelta: number,
  };

  const [mapRegion, setMapRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0422,
    longitudeDelta: 0.0421,
  });
  const [expanded, setExpanded] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [bottomSheetHeight, setBottomSheetHeight] = useState(SNAP_POINTS.COLLAPSED);

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

  const scrollViewRef = useRef<ScrollView>(null);
  const { createNewDelivery } = useDelivery();

  // Auto-snap based on current step
  useEffect(() => {
    if (currentStep >= 3) {
      snapToPosition(SNAP_POINTS.FULL);
    } else if (currentStep >= 2) {
      snapToPosition(SNAP_POINTS.EXPANDED);
    } else if (currentStep >= 1 && expanded) {
      snapToPosition(SNAP_POINTS.PARTIAL);
    } else {
      snapToPosition(SNAP_POINTS.COLLAPSED);
    }
  }, [currentStep, expanded]);

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
        // Expand the bottom sheet when keyboard appears
        if (currentStep >= 2) {
          snapToPosition(SNAP_POINTS.FULL);
        } else {
          snapToPosition(SNAP_POINTS.EXPANDED);
        }
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        // Return to appropriate position when keyboard hides
        if (currentStep >= 3) {
          snapToPosition(SNAP_POINTS.FULL);
        } else if (currentStep >= 2) {
          snapToPosition(SNAP_POINTS.EXPANDED);
        } else if (currentStep >= 1) {
          snapToPosition(SNAP_POINTS.PARTIAL);
        }
      }
    );

    // Clean up listeners
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
      // Limit the drag to screen size
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
        targetSnapPoint = currentStep >= 2 ? SNAP_POINTS.FULL : SNAP_POINTS.EXPANDED;
      } else if (currentHeight < (SNAP_POINTS.COLLAPSED + SNAP_POINTS.PARTIAL) / 2) {
        targetSnapPoint = SNAP_POINTS.COLLAPSED;
      } else if (currentHeight < (SNAP_POINTS.PARTIAL + SNAP_POINTS.EXPANDED) / 2) {
        targetSnapPoint = SNAP_POINTS.PARTIAL;
      } else if (currentHeight < (SNAP_POINTS.EXPANDED + SNAP_POINTS.FULL) / 2) {
        targetSnapPoint = SNAP_POINTS.EXPANDED;
      } else {
        targetSnapPoint = SNAP_POINTS.FULL;
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
      snapToPosition(SNAP_POINTS.PARTIAL);
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
      snapToPosition(SNAP_POINTS.COLLAPSED);
    }
  };

  const handleProceedToPayment = async () => {
    try {
      // Create delivery request
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

      const createdDelivery = await createNewDelivery(deliveryData);

      // Navigate to payment screen with delivery data
      router.push({
        pathname: '/(app)/(sme_tabs)/payment',
        params: { 
          deliveryId: createdDelivery.id,
          deliveryData: JSON.stringify(deliveryData)
        }
      });

    } catch (error) {
      console.error('Error in payment flow:', error);
    }
  };

  const updateFormData = (key: keyof DeliveryForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepSection}>
            <Text style={styles.stepTitle}>Where are we picking up and delivering?</Text>
            
            <View style={styles.inputContainer}>
              <MapPin size={20} color={Colors.light.primary} style={styles.inputIcon} />
              <TextInput
                placeholder="Pickup location"
                style={styles.input}
                value={formData.pickupLocation}
                onChangeText={t => setFormData(d => ({ ...d, pickupLocation: t }))}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <MapPin size={20} color={Colors.light.primary} style={styles.inputIcon} />
              <TextInput
                placeholder="Destination location"
                style={styles.input}
                value={formData.destinationLocation}
                onChangeText={t => setFormData(d => ({ ...d, destinationLocation: t }))}
              />
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepSection}>
            <Text style={styles.stepTitle}>Tell us about your package</Text>
            
            <View style={styles.inputContainer}>
              <Package size={20} color={Colors.light.primary} style={styles.inputIcon} />
              <TextInput
                placeholder="Package description"
                style={styles.input}
                value={formData.packageDescription}
                onChangeText={t => setFormData(d => ({ ...d, packageDescription: t }))}
              />
            </View>
            
            <View style={styles.weightSection}>
              <Text style={styles.sectionSubtitle}>Package Weight</Text>
              <View style={styles.weightTypeContainer}>
                <TouchableOpacity
                  style={[styles.weightTypeButton, formData.weightType === 'weight' && styles.weightTypeButtonActive]}
                  onPress={() => setFormData(d => ({ ...d, weightType: 'weight' }))}
                >
                  <Text style={[styles.weightTypeText, formData.weightType === 'weight' && styles.weightTypeTextActive]}>
                    Weight (kg)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.weightTypeButton, formData.weightType === 'quantity' && styles.weightTypeButtonActive]}
                  onPress={() => setFormData(d => ({ ...d, weightType: 'quantity' }))}
                >
                  <Text style={[styles.weightTypeText, formData.weightType === 'quantity' && styles.weightTypeTextActive]}>
                    Quantity
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                placeholder={formData.weightType === 'weight' ? "Enter weight in kg" : "Enter quantity (e.g. 3)"}
                style={styles.input}
                keyboardType="numeric"
                value={formData.packageWeight}
                onChangeText={t => setFormData(d => ({ ...d, packageWeight: t }))}
              />
            </View>
            
            <View style={styles.qualitiesSection}>
              <Text style={styles.sectionSubtitle}>Package Qualities</Text>
              <View style={styles.qualitiesContainer}>
                {[
                  { id: 'fragile', label: 'Fragile' },
                  { id: 'urgent', label: 'Urgent' },
                  { id: 'coldchain', label: 'Cold Chain' },
                  { id: 'moisture_sensitive', label: 'Moisture Sensitive' }
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
            </View>
            
            <View style={styles.valueRangeSection}>
              <Text style={styles.sectionSubtitle}>Package Value Range</Text>
              <View style={styles.valueRangeContainer}>
                {[
                  { id: 1, label: 'KSh 30-100' },
                  { id: 2, label: 'KSh 110-500' },
                  { id: 3, label: 'KSh 510-1000' },
                  { id: 4, label: 'KSh 1000+' }
                ].map(range => (
                  <TouchableOpacity
                    key={range.id}
                    style={[styles.valueRangeOption, formData.valueRange === range.id && styles.valueRangeOptionActive]}
                    onPress={() => setFormData(d => ({ ...d, valueRange: range.id }))}
                  >
                    <Text style={[styles.valueRangeText, formData.valueRange === range.id && styles.valueRangeTextActive]}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.explanatoryText}>
                This information helps us calculate insurance costs if you choose to insure your goods.
              </Text>
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepSection}>
            <Text style={styles.stepTitle}>Select courier capacity</Text>
            <View style={styles.capacityContainer}>
              {[
                { id: '1', label: 'Bike', icon: 'motorcycle' },
                { id: '2', label: 'Small Car', icon: 'directions-car' },
                { id: '3', label: 'Medium Car', icon: 'airport-shuttle' },
                { id: '4', label: 'Truck', icon: 'local-shipping' }
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
                    name={vehicle.icon as any}
                    size={28}
                    color={formData.vehicleType === vehicle.id ? Colors.light.background : Colors.light.text}
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
            
            <View style={styles.insuranceSection}>
              <Text style={styles.sectionSubtitle}>Add insurance?</Text>
              <View style={styles.insuranceOptions}>
                <TouchableOpacity
                  style={[styles.insuranceOption, formData.insurance === true && styles.insuranceOptionActive]}
                  onPress={() => setFormData(d => ({ ...d, insurance: true }))}
                >
                  <Text style={[styles.insuranceOptionText, formData.insurance === true && styles.insuranceOptionTextActive]}>
                    Yes, insure my goods
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.insuranceOption, formData.insurance === false && styles.insuranceOptionActive]}
                  onPress={() => setFormData(d => ({ ...d, insurance: false }))}
                >
                  <Text style={[styles.insuranceOptionText, formData.insurance === false && styles.insuranceOptionTextActive]}>
                    No insurance needed
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.explanatoryText}>
                Read our terms and conditions for complete insurance coverage details.
              </Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.destinationLocation.length > 0 && formData.pickupLocation.length > 0;
      case 2:
        return formData.packageDescription.length > 0 && formData.packageWeight.length > 0 && formData.valueRange > 0;
      case 3:
        return formData.vehicleType.length > 0 && formData.insurance !== undefined;
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
        {mapRegion && (
          <MapView
            style={[styles.map]}
            region={mapRegion}
            onRegionChangeComplete={setMapRegion}
          />
        )}

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
            contentContainerStyle={[
              styles.scrollContentContainer,
              keyboardVisible && { paddingBottom: 200 }
            ]}
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
                  {currentStep === 3 ? 'Proceed' : 'Continue'}
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
  },
  scrollContentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  stepSection: {
    marginBottom: SPACING.lg,
  },
  stepTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.lg,
    color: Colors.light.text,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  sectionSubtitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  input: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    backgroundColor: Colors.light.card,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    minHeight: 48,
  },
  inputContainer: { 
    flexDirection: 'row',
    alignItems: 'center', 
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  inputIcon: { 
    marginRight: SPACING.sm,
  },
  weightSection: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  weightTypeContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    backgroundColor: Colors.light.card,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
  },
  weightTypeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  weightTypeButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  weightTypeText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
  },
  weightTypeTextActive: {
    color: Colors.light.background,
  },
  qualitiesSection: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  qualitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  valueRangeSection: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  valueRangeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  valueRangeOption: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.card,
    minWidth: '45%',
    alignItems: 'center',
  },
  valueRangeOptionActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  valueRangeText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
  },
  valueRangeTextActive: {
    color: Colors.light.background,
  },
  capacityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  vehicleOption: {
    width: '45%',
    backgroundColor: Colors.light.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    minHeight: 80,
    justifyContent: 'center',
  },
  vehicleOptionActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  vehicleLabel: {
    marginTop: SPACING.xs,
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
    textAlign: 'center',
  },
  vehicleLabelActive: {
    color: Colors.light.background,
  },
  insuranceSection: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  insuranceOptions: {
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  insuranceOption: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.card,
    alignItems: 'center',
  },
  insuranceOptionActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  insuranceOptionText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
  },
  insuranceOptionTextActive: {
    color: Colors.light.background,
  },
  explanatoryText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.placeholder,
    fontStyle: 'italic',
    lineHeight: 16,
    paddingHorizontal: SPACING.xs,
  },
  chip: {
    backgroundColor: Colors.light.card,
    borderColor: Colors.light.border,
    marginRight: 0,
    marginBottom: 0,
  },
  chipActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  chipText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
  },
  chipTextActive: {
    color: Colors.light.background,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
    paddingHorizontal: SPACING.sm,
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
});