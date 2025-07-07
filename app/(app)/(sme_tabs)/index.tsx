import { useState, useRef, useEffect } from 'react';
import { StyleSheet,Text, View,SafeAreaView,TextInput,TouchableOpacity,ScrollView,Dimensions,PanResponder,Animated, Platform, Keyboard,KeyboardAvoidingView} from 'react-native';
import {Chip, Checkbox} from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import { MapPin, Package, Shield, Clock, ArrowRight } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

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
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [insurance, setInsurance] = useState('');
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
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') console.log('Permission granted');
    };

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

    // Set up keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        // Expand the bottom sheet when keyboard appears
        if (!expanded) {
          setExpanded(true);
          Animated.spring(bottomSheetHeight, {
            toValue: screenHeight * 0.7,
            useNativeDriver: false,
          }).start();
        }
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    // Clean up listeners
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [expanded]);

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
      
     <View style={styles.autocompleteContainer}>
      {/* <GooglePlacesAutocomplete
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
      /> */}
       <TextInput
              style={styles.input}
              placeholder="Destination Location"
              placeholderTextColor={Colors.light.placeholder}
              value={formData.destination}
              onChangeText={(text) => updateFormData('destination', text)}
            />
    </View>

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
        onFocus={() => {
          // Scroll to this input when focused
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: 50, animated: true });
          }, 100);
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="Package description"
        placeholderTextColor={Colors.light.placeholder}
        value={formData.packageDescription}
        onChangeText={(text) => updateFormData('packageDescription', text)}
        onFocus={() => {
          // Scroll to this input when focused
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: 120, animated: true });
          }, 100);
        }}
      />

      <Text style={styles.label}>Select package qualities:</Text>
      <View style={styles.chipContainer}> 
        {qualities?.map((q) => (
          <Chip
            key={q}
            selected={formData.selectedQualities.includes(q)}
            onPress={() => toggleQuality(q)}
            style={[styles.chip , formData.selectedQualities.includes(q) && styles.chipActive ]}
            textStyle={[styles.chipText, formData.selectedQualities.includes(q) && styles.chipTextActive]}
          >
            {q}
          </Chip>
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
        onFocus={() => {
          // Scroll to this input when focused
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: 50, animated: true });
          }, 100);
        }}
      />

      <Text style={styles.label}>Add insurance?</Text>
      
      <Checkbox.Item
        label="Yes, insure my goods"
        status={insurance === 'yes' ? 'checked' : 'unchecked'}
        onPress={() => setInsurance('yes')}
      />
      <Checkbox.Item
        label="No, do not insure my goods"
        status={insurance === 'no' ? 'checked' : 'unchecked'}
        onPress={() => setInsurance('no')}
      />

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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {mapRegion? 
      <MapView
        style={[styles.map]}
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
      /> :
      <View>
         <MapView
        style={[styles.map]}
        region={
          {
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }
        }
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
            height: keyboardVisible ? 
              Platform.OS === 'ios' ? screenHeight * 0.8 : bottomSheetHeight : 
              bottomSheetHeight,
            transform: [{ translateY: panY }],
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
          keyboardShouldPersistTaps="never"
          contentContainerStyle={keyboardVisible && { paddingBottom: 200 }}
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
    </KeyboardAvoidingView>
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
    height: '40%', // Reduce map size when keyboard is visible
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
  autocompleteInputContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  autocompleteInput: {
    backgroundColor: '#ccc',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
  },
  autocompleteList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 1001,
  },
  autocompleteRow: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  autocompleteDescription: {
    fontSize: 14,
    color: '#333',
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
    gap: 6 ,
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