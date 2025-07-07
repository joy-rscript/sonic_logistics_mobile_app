import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet,Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  Animated,
  PanResponder,
  Dimensions,
  Switch
} from 'react-native';
import { router } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { Bell, ChevronRight, MapPin, Clock, Package, Navigation } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';
import { CircleUser as UserCircle, Truck } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DeliveryStepper } from '@/components/ui/DeliveryStepper';
import * as Location from 'expo-location';
import { useDelivery } from '@/contexts/DeliveryContext';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

// Constants for bottom sheet snap points
const SNAP_POINTS = {
  COLLAPSED: screenHeight * 0.2,
  PARTIAL: screenHeight * 0.5,
  EXPANDED: screenHeight * 0.75,
  FULL: screenHeight * 0.9
};

export default function CourierHomeScreen() {
  const [mapRegion, setMapRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0422,
    longitudeDelta: 0.0421,
  });
  
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [bottomSheetHeight, setBottomSheetHeight] = useState(SNAP_POINTS.COLLAPSED);
  const scrollViewRef = useRef<ScrollView>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isDeliveryCompleted, setIsDeliveryCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [navigationEnabled, setNavigationEnabled] = useState(true);


  const { 
    allDeliveries, 
    currentDelivery, 
    acceptDelivery,
    updateDeliveryTracker,
    completeDelivery
  } = useDelivery();

  const [selectedDelivery, setSelectedDelivery] = useState(
    allDeliveries.length > 0 ? allDeliveries[0] : null
  );

  // Bottom sheet animation
  const bottomSheetAnim = useRef(new Animated.Value(SNAP_POINTS.COLLAPSED)).current;
  const panY = useRef(new Animated.Value(0)).current;

  // current location to display on map based on delivery status
  const getCurrentMapLocation = () => {
    if (!currentDelivery) return null;
    
    const { tracker } = currentDelivery;
    
    // If pickup is pending, show pickup location
    if (!tracker || tracker.pickup === 'pending') {
      return {
        coordinates: currentDelivery.pickupCord,
        address: currentDelivery.pickup,
        type: 'pickup'
      };
    }
    
    // If pickup is completed but dropoff is pending, show dropoff location
    if (tracker.pickup === 'completed' && tracker.dropoff === 'pending') {
      return {
        coordinates: currentDelivery.dropoffCord,
        address: currentDelivery.dropoff,
        type: 'dropoff'
      };
    }
    
    // Default to dropoff location
    return {
      coordinates: currentDelivery.dropoffCord,
      address: currentDelivery.dropoff,
      type: 'dropoff'
    };
  };

  const currentMapLocation = getCurrentMapLocation();

  //current step based on delivery tracker
  useEffect(() => {
    if (currentDelivery?.tracker) {
      const tracker = currentDelivery.tracker;
      let step = 0;
      
      if (tracker.pickup === 'completed') step = 1;
      if (tracker.pickupCode) step = 2;
      if (tracker.pickupImage) step = 3;
      if (tracker.dropoff === 'completed') step = 4;
      if (tracker.dropoffCode) step = 5;
      if (tracker.dropoffImage) step = 6;
      
      setCurrentStep(step);
      setIsDeliveryCompleted(step === 6);
    }
  }, [currentDelivery]);

  useEffect(() => {
    if (!currentDelivery) return;

    if (currentStep >= 5) {
      snapToPosition(SNAP_POINTS.FULL);
    } else if (currentStep >= 3) {
      snapToPosition(SNAP_POINTS.EXPANDED);
    } else if (currentStep >= 1) {
      snapToPosition(SNAP_POINTS.PARTIAL);
    } else {
      snapToPosition(SNAP_POINTS.COLLAPSED);
    }
  }, [currentStep, currentDelivery]
);

  // Set up location and keyboard listeners
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
        snapToPosition(SNAP_POINTS.EXPANDED);
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        // Return to previous position when keyboard hides
        snapToPosition(SNAP_POINTS.PARTIAL);
      }
    );

    // Clean up listeners
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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

  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'New Delivery Request',
      message: 'You have a new delivery request from TechCorp Solutions.',
      type: 'delivery',
      read: false,
    },
    {
      id: '2',
      title: 'Route Optimization',
      message: 'Your delivery route has been optimized for better efficiency.',
      type: 'update',
      read: false,
    },
  ]);

  const handleNotificationRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? {...notif, read: true} : notif
      )
    );
  };

  const handleAcceptDelivery = (requestId: string) => {
    acceptDelivery(requestId);
    router.replace('/(app)/(courier_tabs)/deliveries');
  };

  const handleStepComplete = (stepId: string, data?: any) => {
    if (!currentDelivery) return;

    const deliveryId = currentDelivery.id;
    
    switch (stepId) {
      case 'pickup_done':
        updateDeliveryTracker(deliveryId, { pickup: 'completed' });
        break;
      case 'sms_code':
        updateDeliveryTracker(deliveryId, { pickupCode: data.code });
        break;
      case 'pickup_image':
        updateDeliveryTracker(deliveryId, { pickupImage: data.image });
        break;
      case 'dropoff_done':
        updateDeliveryTracker(deliveryId, { dropoff: 'completed' });
        break;
      case 'recipient_code':
        updateDeliveryTracker(deliveryId, { dropoffCode: data.code });
        break;
      case 'delivery_image':
        updateDeliveryTracker(deliveryId, { dropoffImage: data.image });
        // Complete the delivery when all steps are done
        setTimeout(() => {
          completeDelivery(deliveryId);
          setIsDeliveryCompleted(false);
          setCurrentStep(0);
        }, 2000);
        break;
    }
  };

  const getBadgeVariant = (badge: string) => {
    switch (badge.toLowerCase()) {
      case 'premium':
        return 'primary';
      case 'cold chain':
        return 'secondary';
      case 'perishables':
        return 'warning';
      case 'fragile':
        return 'error';
      case 'express':
        return 'success';
      default:
        return 'primary';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {!currentDelivery || navigationEnabled? (
        // Show available deliveries when no current delivery
        <View>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hi Martin,</Text>
              <Text style={styles.subGreeting}>Ready for deliveries?</Text>
            </View>
            <TouchableOpacity onPress={() => setShowNotifications(prev => !prev)} style={styles.notificationButton}>
              <Bell size={24} color={Colors.light.text} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>

          {showNotifications && (
            <View style={styles.notificationsOverlay}>
              <Text style={styles.sectionTitle}>Notifications</Text>
              {notifications.map(notification => (
                <TouchableOpacity 
                  key={notification.id} 
                  style={[styles.notificationCard, notification.read && styles.notificationCardRead]}
                  onPress={() => handleNotificationRead(notification.id)}
                >
                  <View style={[styles.notificationIcon, { backgroundColor: notification.type === 'update' ? '#4CAF50' : '#FFC107' }]}>
                    <Text style={styles.notificationIconText}>{notification.type === 'update' ? 'U' : 'D'}</Text>
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                      {notification.message}
                    </Text>
                  </View>
                  {!notification.read && <View style={styles.unreadIndicator} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {!showNotifications && allDeliveries.length > 0 ? (
            <View style={styles.deliveriesSection}>
              <Text style={styles.sectionTitle}>Available Deliveries</Text>
              
              <FlatList
                data={allDeliveries}
                horizontal
                snapToInterval={320}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContainer}
                onMomentumScrollEnd={({ nativeEvent }) => {
                  const index = Math.round(nativeEvent.contentOffset.x / 320);
                  if (allDeliveries[index]) {
                    setSelectedDelivery(allDeliveries[index]);
                  }
                }}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => setSelectedDelivery(item)}>
                    <Card style={[
                      styles.horizontalCard,
                      selectedDelivery?.id === item.id && styles.selectedCard
                    ]}>
                      {/* Delivery Details */}
                      <View style={styles.deliveryHeading}>
                        <View style={styles.iconTextRow}>
                          <MaterialIcons name="local-shipping" size={26} color={Colors.light.placeholder}/>
                          <Text style={styles.deliveryLocation}>Package in: {item.location.slice(0, 6)}</Text>
                        </View>
                        <Badge label={`KSh ${item.price}`} variant="primary" />
                      </View>
                      {/* Client Info */}
                      <View style={styles.clientSection}>
                        <View>
                          <UserCircle size={26} color={Colors.light.placeholder} />
                        </View>
                        <View style={styles.textColumn}>
                          <Text style={styles.clientName}>{item.clientName}</Text>
                          <Text style={styles.clientRole}>{item.clientType}</Text>
                        </View>
                      </View>

                      <View style={styles.estimateRow}>
                        <Clock size={16} color={Colors.light.placeholder} />
                        //would need to compute distance using google maps i guess
                        <Text style={styles.estimateText}>{item.estimate.split('|')[1]?.trim() || '2hrs'}</Text>
                      </View>
                    </Card>
                  </TouchableOpacity>
                )}      
              />

              {selectedDelivery && (
                <Card style={styles.detailedCard}>
                  <Text style={styles.detailsTitle}>Request Details</Text>
                  
                  <View style={styles.badgeContainer}>
                    {selectedDelivery.badges.map((badge, i) => (
                      <Badge 
                        key={i} 
                        label={badge} 
                        variant={getBadgeVariant(badge) as any}
                        style={styles.detailBadge}
                      />
                    ))}
                  </View>

                  <View style={styles.locationSection}>
                    <View style={styles.locationRow}>
                      <View style={styles.locationDot} />
                      <View style={styles.locationInfo}>
                        <Text style={styles.locationLabel}>Pickup</Text>
                        <Text style={styles.locationAddress}>{selectedDelivery.pickup}</Text>
                        <Text style={styles.coordinatesText}>
                          {selectedDelivery.pickupCord.latitude.toFixed(4)}, {selectedDelivery.pickupCord.longitude.toFixed(4)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.locationLine} />

                    <View style={styles.locationRow}>
                      <View style={[styles.locationDot, styles.destinationDot]} />
                      <View style={styles.locationInfo}>
                        <Text style={styles.locationLabel}>Drop Off</Text>
                        <Text style={styles.locationAddress}>{selectedDelivery.dropoff}</Text>
                        <Text style={styles.coordinatesText}>
                          {selectedDelivery.dropoffCord.latitude.toFixed(4)}, {selectedDelivery.dropoffCord.longitude.toFixed(4)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.estimateContainer}>
                    <Clock size={16} color={Colors.light.placeholder} />
                    <Text style={styles.estimateDetailText}>{selectedDelivery.estimate}</Text>
                  </View>

                  {selectedDelivery.instructions && (
                    <TouchableOpacity
                      onPress={() => setShowInstructions(prev => !prev)}
                      style={styles.instructionsToggle}
                    >
                      <Text style={styles.instructionsToggleText}>
                        {showInstructions ? 'Hide Instructions' : 'View Instructions & Map'}
                      </Text>
                      <ChevronRight 
                        size={16} 
                        color={Colors.light.primary}
                        style={{ transform: [{ rotate: showInstructions ? '90deg' : '0deg' }] }}
                      />
                    </TouchableOpacity>
                  )}

                  {showInstructions && selectedDelivery.instructions && (
                    <View style={styles.instructionsContainer}>
                      <Text style={styles.instructionsText}>{selectedDelivery.instructions}</Text>
                    </View>
                  )}

                  <TouchableOpacity 
                    style={styles.acceptButton}
                    onPress={() => handleAcceptDelivery(selectedDelivery.id)}
                  >
                    <Text style={styles.acceptButtonText}>Accept Delivery</Text>
                  </TouchableOpacity>
                </Card>
              )}
            </View>
          ) : (
            // Empty State - Show when no deliveries available and no current delivery
            <View style={styles.emptyState}>
              <Package size={64} color={Colors.light.placeholder} />
              <Text style={styles.emptyStateTitle}>No Available Deliveries</Text>
              <Text style={styles.emptyStateText}>Check back later for new delivery requests</Text>
            </View>
          )}
        </View>
      ) : (
        // Show map and delivery stepper when there's a current delivery
        <KeyboardAvoidingView 
          style={styles.mapContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Map View */}
          {currentMapLocation ? (
            <MapView
              style={styles.map}
              region={currentMapLocation.coordinates}
              provider="google"
            >
              <Marker
                coordinate={currentMapLocation.coordinates}
                title={currentMapLocation.type === 'pickup' ? 'Pickup Location' : 'Dropoff Location'}
                description={currentMapLocation.address}
              />
            </MapView>
          ) : (
            <MapView
              style={styles.map}
              region={mapRegion}
              provider="google"
            />
          )}
          <View style={styles.mapHeader}>
            <View style={styles.mapHeaderLeft}>
              <Text style={styles.mapHeaderTitle}>Current Delivery</Text>
            </View>

            <View style={styles.mapHeaderRight}>
              <Text style={styles.mapHeaderText}>Route</Text>
              <Switch
                value={navigationEnabled}
                onValueChange={setNavigationEnabled}
                // thumbColor={navigationEnabled ? Colors.light.primary : Colors.light.disabled}
              />
            </View>
          </View>



          {/* Bottom Sheet with Stepper */}
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
            <View style={styles.dragHandle} />
            <Text style={styles.sectionTitle}>Delivery Progress</Text>            
            <ScrollView 
              ref={scrollViewRef}
              style={styles.bottomSheetContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[
                styles.bottomSheetContentContainer,
                keyboardVisible && { paddingBottom: 200 }
              ]}
            >
              <DeliveryStepper 
                onStepComplete={handleStepComplete}
                currentStep={currentStep}
                isCompleted={isDeliveryCompleted}
              />
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapHeader: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.medium,
    zIndex: 1,
  },
  mapHeaderTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
  },
  mapHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mapHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapHeaderText: {
    fontSize: 12,
    color: Colors.light.text,
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
    zIndex: 1,
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
  bottomSheetContentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  greeting: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.xl,
    color: Colors.light.text,
  },
  subGreeting: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: Colors.light.placeholder,
  },
  notificationButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    ...SHADOWS.light,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.error,
  },
  notificationsOverlay: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: Colors.light.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.medium,
  },
  sectionTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.lg,
    color: Colors.light.text,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.light,
    position: 'relative',
  },
  notificationCardRead: {
    opacity: 0.7,
  },
  notificationIcon: {
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  notificationIconText: {
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.md,
    color: Colors.light.background,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    marginBottom: 2,
  },
  notificationMessage: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
  },
  deliveriesSection: {
    marginBottom: SPACING.xl,
  },
  horizontalListContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  horizontalCard: {
    width: 300,
    height: 140,
    marginRight: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: Colors.light.card,
    ...SHADOWS.light,
  },
  selectedCard: {
    borderColor: Colors.light.primary,
    borderWidth: 2,
  },
  deliveryHeading: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryLocation: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    marginLeft: SPACING.sm,
  },
  clientSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  profileIconCircle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  textColumn: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  clientName: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
  },
  clientRole: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.placeholder,
  },
  estimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estimateText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.placeholder,
    marginLeft: SPACING.xs,
  },
  detailedCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: Colors.light.card,
    ...SHADOWS.medium,
  },
  detailsTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    marginBottom: SPACING.md,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.lg,
  },
  detailBadge: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  locationSection: {
    marginBottom: SPACING.lg,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.primary,
    marginTop: 4,
    marginRight: SPACING.md,
  },
  destinationDot: {
    backgroundColor: Colors.light.error,
  },
  locationLine: {
    width: 2,
    height: 20,
    backgroundColor: Colors.light.border,
    marginLeft: 5,
    marginVertical: SPACING.xs,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
    marginBottom: 2,
  },
  locationAddress: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
    lineHeight: 18,
    marginBottom: 2,
  },
  coordinatesText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.placeholder,
  },
  estimateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  estimateDetailText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
    marginLeft: SPACING.xs,
  },
  instructionsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  instructionsToggleText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.primary,
  },
  instructionsContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  instructionsText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
    lineHeight: 18,
  },
  acceptButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  acceptButtonText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.background,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
  },
  emptyStateTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.lg,
    color: Colors.light.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyStateText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: Colors.light.placeholder,
    textAlign: 'center',
  },
});