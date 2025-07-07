import { useState, useRef, useEffect } from 'react';
import { StyleSheet,Text, View,SafeAreaView,TextInput,TouchableOpacity,ScrollView,Dimensions,PanResponder,Animated, Platform} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MapPin, Package, Shield, Clock, ArrowRight } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import * as Location from 'expo-location';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface DeliveryFormData {
  destination: string;
  packageName: string;
  packageDescription: string;
  instructions: string;
  insurance: 'yes' | 'no' | '';
  selectedQualities: string[];
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
      }
  );
  const [userName] = useState('Maureen');
  const [expanded, setExpanded] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form field state
  const [formData, setFormData] = useState<DeliveryFormData>({
    destination: '',
    packageName: '',
    packageDescription: '',
    instructions: '',
    insurance: '',
    selectedQualities: [],
  });

  const [errorMsg, setErrorMsg] = useState(''); 
  const qualities = ['Fragile', 'Heavy', 'Perishable', 'Urgent'];
  const GOOGLE_MAPS_API_KEY = "AIzaSyACYutpN5jEGD0vsGBL0b2i3HMYtWXpInQ";

  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') console.log('Permission granted');
    };

    // const fetchDetails = async () => {
    //   const name = await SecureStore.getItemAsync('firstName');
    //   setUserName(name || '');
    // };

    const getCurrentLocation = async () => {
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0422,
            longitudeDelta: 0.0421,
      });
    }

    getCurrentLocation();
    
    getPermissions();
    // fetchDetails();
  }, []);

  // Bottom sheet animation
  const bottomSheetHeight = useRef(new Animated.Value(200)).current;
  const panY = useRef(new Animated.Value(0)).current;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > 10;
    },
    onPanResponderMove: (evt, gestureState) => {
      panY.setValue(gestureState.dy);
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy > 50) {
        // Swipe down - minimize
        setExpanded(false);
        Animated.spring(bottomSheetHeight, {
          toValue: 200,
          useNativeDriver: false,
        }).start();
      } else if (gestureState.dy < -50) {
        // Swipe up - expand
        setExpanded(true);
        Animated.spring(bottomSheetHeight, {
          toValue: screenHeight * 0.7,
          useNativeDriver: false,
        }).start();
      }
      
      Animated.spring(panY, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    },
  });

  const handleContinue = () => {
    if (!expanded) {
      setExpanded(true);
      Animated.spring(bottomSheetHeight, {
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
      Animated.spring(bottomSheetHeight, {
        toValue: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleProceed = () => {
    console.log('Creating delivery request:', formData);
    // Handle delivery request creation
  };

  const updateFormData = (key: keyof DeliveryFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

//add quality to selection if not originally part else, remove
  const toggleQuality = (quality: string) => {
    const newQualities = formData.selectedQualities.includes(quality)
      ? formData.selectedQualities.filter(q => q !== quality)
      : [...formData.selectedQualities, quality];
    updateFormData('selectedQualities', newQualities);
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.greeting}>Hey {userName}, make a new delivery request</Text>
      
      {/* <View style={styles.autocompleteContainer}>
        <GooglePlacesAutocomplete
          placeholder="Enter destination location"
          onPress={(data, details = null) => {
            setDestination(data.description);
            updateFormData('destination', data.description);
            if (details) {
              setMapRegion({
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              });
            }
          }}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: 'en',
            components: 'country:ke',
          }}
          styles={{
            textInputContainer: styles.autocompleteInputContainer,
            textInput: styles.autocompleteInput,
            listView: styles.autocompleteList,
            row: styles.autocompleteRow,
            description: styles.autocompleteDescription,
          }}
          fetchDetails={true}
          enablePoweredByContainer={false}
        />
      </View> */}
      <TextInput
        style={styles.input}
        placeholder="Destination Location"
        placeholderTextColor={Colors.light.placeholder}
        value={formData.destination}
        onChangeText={(text) => updateFormData('destination', text)}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Package Details</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Package title/name"
        placeholderTextColor={Colors.light.placeholder}
        value={formData.packageName}
        onChangeText={(text) => updateFormData('packageName', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Package description"
        placeholderTextColor={Colors.light.placeholder}
        value={formData.packageDescription}
        onChangeText={(text) => updateFormData('packageDescription', text)}
      />

      <Text style={styles.label}>Select package qualities:</Text>
      <View style={styles.chipContainer}>
        {qualities.map((quality) => (
          <TouchableOpacity
            key={quality}
            style={[
              styles.chip,
              formData.selectedQualities.includes(quality) && styles.chipActive
            ]}
            onPress={() => toggleQuality(quality)}
          >
            <Text style={[
              styles.chipText,
              formData.selectedQualities.includes(quality) && styles.chipTextActive
            ]}>
              {quality}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Additional Information</Text>
      
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Optional instructions"
        placeholderTextColor={Colors.light.placeholder}
        value={formData.instructions}
        onChangeText={(text) => updateFormData('instructions', text)}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Add insurance?</Text>
      
      <TouchableOpacity
        style={[styles.checkboxItem, formData.insurance === 'yes' && styles.checkboxItemActive]}
        onPress={() => updateFormData('insurance', 'yes')}
      >
        <View style={[styles.checkbox, formData.insurance === 'yes' && styles.checkboxActive]}>
          {formData.insurance === 'yes' && <View style={styles.checkboxCheck} />}
        </View>
        <Text style={styles.checkboxLabel}>Yes, insure my goods</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.checkboxItem, formData.insurance === 'no' && styles.checkboxItemActive]}
        onPress={() => updateFormData('insurance', 'no')}
      >
        <View style={[styles.checkbox, formData.insurance === 'no' && styles.checkboxActive]}>
          {formData.insurance === 'no' && <View style={styles.checkboxCheck} />}
        </View>
        <Text style={styles.checkboxLabel}>No, do not insure my goods</Text>
      </TouchableOpacity>

      <Text style={styles.link}>
        Read terms and conditions for our insurance coverage.
      </Text>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.destination.length > 0;
      case 2:
        return formData.packageName.length > 0 && formData.packageDescription.length > 0;
      case 3:
        return formData.insurance !== '';
      default:
        return false;
    }
  };

  return (
    <View style={styles.container}>
      {/* Map Background */}
      <MapView
        style={styles.map}
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Your Location"
          />
        )}
      </MapView>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            height: bottomSheetHeight,
            transform: [{ translateY: panY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Drag Handle */}
        <View style={styles.dragHandle} />

        <ScrollView 
          style={styles.bottomSheetContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {renderCurrentStep()}

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
    </View>
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
    marginBottom: SPACING.md,
  },
  autocompleteInputContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  autocompleteInput: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    backgroundColor: 'transparent',
  },
  autocompleteList: {
    backgroundColor: Colors.light.background,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.xs,
    ...SHADOWS.light,
  },
  autocompleteRow: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  autocompleteDescription: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
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
    marginBottom: SPACING.md,
  },
  chip: {
    backgroundColor: Colors.light.card,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  chipText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
  },
  chipTextActive: {
    color: Colors.light.background,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  checkboxItemActive: {
    backgroundColor: `${Colors.light.primary}10`,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.border,
    marginRight: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  checkboxCheck: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.background,
  },
  checkboxLabel: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    flex: 1,
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