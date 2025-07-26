import { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, ScrollView, 
  Dimensions, PanResponder, Animated, Platform, Keyboard, KeyboardAvoidingView,
  TouchableWithoutFeedback
} from 'react-native';
import { Chip, Checkbox } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import { MapPin, Package, Shield, Clock, ArrowRight } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import * as Location from 'expo-location';
import { useDelivery } from '@/contexts/DeliveryContext';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker'

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
  vehicleType:string,
  valueRange: number;
  insurance : boolean;
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
    insurance : false
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
        handleProceed();
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

  const { createNewDelivery } = useDelivery();

  const handleProceed = () => {
    console.log('Creating delivery request:', formData);

    createNewDelivery({
      pickup: formData.pickupLocation,
      dropoff: formData.destinationLocation,
      packageDescription: formData.packageDescription,
      selectedQualities: formData.qualities,
      insurance: formData.insurance ? 'yes' : 'no',
      destination: formData.destinationLocation,
      packageName: formData.packageDescription,
      status: 'pending',
    });

    // Reset form
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
    insurance : false
    });
    setInsurance('');
    setExpanded(false);
    setCurrentStep(1);
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


  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.destinationLocation.length > 0;
      case 2:
        return formData.packageDescription.length > 0 && formData.packageDescription.length > 0;
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
});