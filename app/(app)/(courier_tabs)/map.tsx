import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  Animated,
  PanResponder,
  Dimensions,
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { ArrowLeft, Phone, MessageSquare, Navigation, MapPin, Clock, Package, ChevronDown, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DeliveryStepper } from '@/components/ui/DeliveryStepper';
import { NotificationBell } from '@/components/ui/NotificatonBell';
import { useNotificationsByType } from '@/contexts/NotificationContext';
import { NotificationPanel } from '@/components/ui/NotificationPanel';
import { useDelivery } from '@/contexts/DeliveryContext';
import * as Location from 'expo-location';

const { height: screenHeight } = Dimensions.get('window');

const SNAP_POINTS = {
  COLLAPSED: screenHeight * 0.2,
  PARTIAL: screenHeight * 0.5,
  EXPANDED: screenHeight * 0.75,
  FULL: screenHeight * 0.9
};

export default function CourierMapScreen() {
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showDropoffDetails, setShowDropoffDetails] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0422,
    longitudeDelta: 0.0421,
  });
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [bottomSheetHeight, setBottomSheetHeight] = useState(SNAP_POINTS.COLLAPSED);
  const [isDeliveryCompleted, setIsDeliveryCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [navigationEnabled, setNavigationEnabled] = useState(true);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{latitude: number, longitude: number}>>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeDistance, setRouteDistance] = useState<string>('');
  const [routeDuration, setRouteDuration] = useState<string>('');
  const [stepperExpanded, setStepperExpanded] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  
  // Use map-specific notifications
  const { 
    notifications: mapNotifications, 
    unreadCount: mapUnreadCount, 
    markAsRead,
    refreshNotifications 
  } = useNotificationsByType('map');

  const { 
    currentDelivery, 
    updateDeliveryTracker,
    completeDelivery,
  } = useDelivery();

  // Bottom sheet animation
  const bottomSheetAnim = useRef(new Animated.Value(SNAP_POINTS.COLLAPSED)).current;
  const panY = useRef(new Animated.Value(0)).current;

  // Check if pickup is completed
  const isPickupCompleted = currentDelivery?.tracker?.pickup === 'completed';

  // Get delivery status for badge
  const getDeliveryStatus = () => {
    if (!currentDelivery?.tracker) return 'Pickup Pending';
    
    const { pickup, dropoff } = currentDelivery.tracker;
    
    if (dropoff === 'completed') return 'Completed';
    if (pickup === 'completed') return 'Drop-off Pending';
    return 'Pickup Pending';
  };

  // Get badge variant based on status
  const getStatusBadgeVariant = () => {
    const status = getDeliveryStatus();
    switch (status) {
      case 'Completed': return 'success';
      case 'Drop-off Pending': return 'warning';
      case 'Pickup Pending': return 'secondary';
      default: return 'secondary';
    }
  };
  // Get current location to display on map based on delivery status
  const getCurrentMapLocation = () => {
    if (!currentDelivery) return null;
    
    const { tracker } = currentDelivery;
    
    // If pickup is pending, show pickup location
    if (!tracker || tracker.pickup === 'pending') {
      return {
        coordinates: currentDelivery.pickupCord,
        address: currentDelivery.pickupLocation,
        type: 'pickup'
      };
    }
    
    // If pickup is completed but dropoff is pending, show dropoff location
    if (tracker.pickup === 'completed' && tracker.dropoff === 'pending') {
      return {
        coordinates: currentDelivery.dropoffCord,
        address: currentDelivery.dropoffLocation,
        type: 'dropoff'
      };
    }
    
    // Default to dropoff location
    return {
      coordinates: currentDelivery.dropoffCord,
      address: currentDelivery.dropoffLocation,
      type: 'dropoff'
    };
  };

  const currentMapLocation = getCurrentMapLocation();

  // Function to get route between two points using Google Directions API
  const getDirectionsRoute = async (origin: {latitude: number, longitude: number}, destination: {latitude: number, longitude: number}) => {
    setIsLoadingRoute(true);
    try {
      const apiKey = process.env.EXPO_PUBLIC_MAPS_API_KEY;
      if (!apiKey) {
        console.warn('Google Maps API key not found, creating realistic road route');
        // Create a more realistic route that follows potential roads
        const mockRoute = createRealisticRoute(origin, destination);
        setRouteCoordinates(mockRoute);
        
        // Calculate approximate distance and duration
        const distance = calculateDistance(origin, destination);
        setRouteDistance(`${distance.toFixed(1)} km`);
        setRouteDuration(`${Math.ceil(distance * 2.5)} mins`); // Approximate 2.5 mins per km
        return;
      }

      const originStr = `${origin.latitude},${origin.longitude}`;
      const destinationStr = `${destination.latitude},${destination.longitude}`;
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&key=${apiKey}`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const points = decodePolyline(route.overview_polyline.points);
        setRouteCoordinates(points);
        
        // Extract distance and duration
        const leg = route.legs[0];
        setRouteDistance(leg.distance.text);
        setRouteDuration(leg.duration.text);
      } else {
        // Fallback to realistic route if no Google route found
        const mockRoute = createRealisticRoute(origin, destination);
        setRouteCoordinates(mockRoute);
        const distance = calculateDistance(origin, destination);
        setRouteDistance(`${distance.toFixed(1)} km`);
        setRouteDuration(`${Math.ceil(distance * 2.5)} mins`);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      // Fallback to realistic route
      const mockRoute = createRealisticRoute(origin, destination);
      setRouteCoordinates(mockRoute);
      const distance = calculateDistance(origin, destination);
      setRouteDistance(`${distance.toFixed(1)} km`);
      setRouteDuration(`${Math.ceil(distance * 2.5)} mins`);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Create a more realistic route that follows potential road patterns
  const createRealisticRoute = (origin: {latitude: number, longitude: number}, destination: {latitude: number, longitude: number}) => {
    const points = [];
    const steps = 8; // Number of intermediate points
    
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      
      // Add some curvature to simulate road patterns
      const latOffset = Math.sin(ratio * Math.PI) * 0.002 * (Math.random() - 0.5);
      const lngOffset = Math.cos(ratio * Math.PI * 2) * 0.002 * (Math.random() - 0.5);
      
      points.push({
        latitude: origin.latitude + (destination.latitude - origin.latitude) * ratio + latOffset,
        longitude: origin.longitude + (destination.longitude - origin.longitude) * ratio + lngOffset,
      });
    }
    
    return points;
  };

  // Calculate distance between two coordinates
  const calculateDistance = (origin: {latitude: number, longitude: number}, destination: {latitude: number, longitude: number}) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (destination.latitude - origin.latitude) * Math.PI / 180;
    const dLon = (destination.longitude - origin.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(origin.latitude * Math.PI / 180) * Math.cos(destination.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Function to decode Google's polyline encoding
  const decodePolyline = (encoded: string) => {
    const points = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return points;
  };

  // Update route when delivery or location changes
  useEffect(() => {
    if (currentDelivery && currentMapLocation && currentDelivery.CourierDetails?.CourierCoordinates) {
      const courierLocation = {
        latitude: currentDelivery.CourierDetails.CourierCoordinates.latitude,
        longitude: currentDelivery.CourierDetails.CourierCoordinates.longitude,
      };
      
      const targetLocation = {
        latitude: currentMapLocation.coordinates.latitude,
        longitude: currentMapLocation.coordinates.longitude,
      };
      
      getDirectionsRoute(courierLocation, targetLocation);
    } else {
      setRouteCoordinates([]);
    }
  }, [currentDelivery, currentMapLocation]);

  // Set current step based on delivery tracker
  useEffect(() => {
    if (currentDelivery?.tracker) {
      const tracker = currentDelivery.tracker;
      let step = 0;
      
      if (tracker.pickupCode) step = 1;
      if (tracker.pickupImage && tracker.pickup === 'completed') step = 2;
      if (tracker.dropoffCode) step = 3;
      if (tracker.dropoffImage && tracker.dropoff === 'completed') step = 4;
      
      setCurrentStep(step);
      setIsDeliveryCompleted(step === 4);
    }
  }, [currentDelivery]);

  // Auto-snap based on current step
  useEffect(() => {
    if (!currentDelivery) {
      snapToPosition(SNAP_POINTS.COLLAPSED);
      return;
    }

    if (stepperExpanded) {
      snapToPosition(SNAP_POINTS.EXPANDED);
    } else if (currentStep >= 3) {
      snapToPosition(SNAP_POINTS.FULL);
    } else if (currentStep >= 2) {
      snapToPosition(SNAP_POINTS.EXPANDED);
    } else if (currentStep >= 1) {
      snapToPosition(SNAP_POINTS.PARTIAL);
    } else {
      snapToPosition(SNAP_POINTS.COLLAPSED);
    }
  }, [currentStep, currentDelivery, stepperExpanded]);

  // Set up location and keyboard listeners
  useEffect(() => {
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

    // Set up keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        if (currentDelivery && currentStep >= 3) {
          snapToPosition(SNAP_POINTS.FULL);
        } else if (currentDelivery && currentStep >= 2) {
          snapToPosition(SNAP_POINTS.EXPANDED);
        } else if (currentDelivery) {
          snapToPosition(SNAP_POINTS.PARTIAL);
        }
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        if (stepperExpanded) {
          snapToPosition(SNAP_POINTS.EXPANDED);
        } else if (currentDelivery && currentStep >= 3) {
          snapToPosition(SNAP_POINTS.FULL);
        } else if (currentDelivery && currentStep >= 2) {
          snapToPosition(SNAP_POINTS.EXPANDED);
        } else if (currentDelivery && currentStep >= 1) {
          snapToPosition(SNAP_POINTS.PARTIAL);
        }
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [currentDelivery, currentStep]);

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
        targetSnapPoint = currentStep >= 3 ? SNAP_POINTS.FULL : SNAP_POINTS.EXPANDED;
      } else if (currentHeight < (SNAP_POINTS.COLLAPSED + SNAP_POINTS.PARTIAL) / 2) {
        targetSnapPoint = SNAP_POINTS.COLLAPSED;
        setStepperExpanded(false);
      } else if (currentHeight < (SNAP_POINTS.PARTIAL + SNAP_POINTS.EXPANDED) / 2) {
        targetSnapPoint = SNAP_POINTS.PARTIAL;
        setStepperExpanded(false);
      } else if (currentHeight < (SNAP_POINTS.EXPANDED + SNAP_POINTS.FULL) / 2) {
        targetSnapPoint = SNAP_POINTS.EXPANDED;
        setStepperExpanded(true);
      } else {
        targetSnapPoint = SNAP_POINTS.FULL;
        setStepperExpanded(true);
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

  const handleStepComplete = (stepId: string, data?: any) => {
    if (!currentDelivery) return;

    const deliveryId = currentDelivery.id;
    
    switch (stepId) {
      case 'pickup_sms':
        updateDeliveryTracker(deliveryId, { pickupCode: data.code });
        break;
      case 'pickup_image':
        updateDeliveryTracker(deliveryId, { pickupImage: data.image });
        // Mark pickup as completed after photo is taken
        updateDeliveryTracker(deliveryId, { pickup: 'completed' });
        break;
      case 'dropoff_sms':
        updateDeliveryTracker(deliveryId, { dropoffCode: data.code });
        break;
      case 'dropoff_image':
        updateDeliveryTracker(deliveryId, { dropoffImage: data.image });
        // Mark dropoff as completed after photo is taken
        updateDeliveryTracker(deliveryId, { dropoff: 'completed' });
        // Complete the delivery when all steps are done
        setTimeout(() => {
          completeDelivery(deliveryId);
          setIsDeliveryCompleted(false);
          setCurrentStep(0);
        }, 2000);
        break;
    }
  };

  const header = {
    headerTitle: 'Delivery Map',
    headerSubtitle: 'No active delivery'
  };

  const deliveryInfoHeader = {
    sectionTitle: 'Delivery Progress'
  };

  if (!currentDelivery) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{header.headerTitle}</Text>
            <Text style={styles.headerSubtitle}>{header.headerSubtitle}</Text>
          </View>
          <NotificationBell 
            hasUnread={mapUnreadCount > 0}
            onPress={() => setShowNotificationPanel(true)}
          />
        </View>

        <View style={styles.emptyMapContainer}>
          <View style={styles.mapPlaceholder}>
            <MapPin size={48} color={Colors.light.primary} />
            <Text style={styles.mapPlaceholderText}>No Active Delivery</Text>
            <Text style={styles.mapPlaceholderSubtext}>
              Accept a delivery from the Home tab to see navigation here
            </Text>
          </View>
        </View>

        <NotificationPanel
          visible={showNotificationPanel}
          onClose={() => setShowNotificationPanel(false)}
          notifications={mapNotifications}
          onNotificationRead={markAsRead}
          title="Map Notifications"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
            showsUserLocation={true}
            showsMyLocationButton={false}
          >
            {/* Current Target Marker */}
            <Marker
              coordinate={currentMapLocation.coordinates}
              title={currentMapLocation.type === 'pickup' ? 'Pickup Location' : 'Dropoff Location'}
              description={currentMapLocation.address}
              pinColor={currentMapLocation.type === 'pickup' ? Colors.light.primary : Colors.light.error}
            />
            
            {/* Driver Location Marker */}
            {currentDelivery.CourierDetails?.CourierCoordinates && (
              <Marker
                coordinate={currentDelivery.CourierDetails.CourierCoordinates}
                title="Your Location"
                description="Current driver position"
                pinColor={Colors.light.success}
              />
            )}
            
            {/* Route Polyline */}
            {routeCoordinates.length > 1 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor={Colors.light.primary}
                strokeWidth={4}
                strokePattern={[1]}
                geodesic={true}
              />
            )}
          </MapView>
        ) : (
          <MapView
            style={styles.map}
            region={mapRegion}
            provider="google"
          />
        )}

        {/* Map Header */}
        <View style={styles.mapHeader}>
          <View style={styles.mapHeaderLeft}>
            <Text style={styles.mapHeaderTitle}>Active Delivery</Text>
            <Text style={styles.mapHeaderSubtitle}>
              {currentMapLocation?.type === 'pickup' ? 'En route to pickup' : 'En route to dropoff'}
            </Text>
          </View>

          <View style={styles.mapHeaderRight}>
            <NotificationBell 
              hasUnread={mapUnreadCount > 0}
              onPress={() => setShowNotificationPanel(true)}
            />
            {isLoadingRoute && (
              <ActivityIndicator 
                size="small" 
                color={Colors.light.primary} 
                style={styles.routeLoader}
              />
            )}
          </View>
        </View>

        {/* Navigation Toggle */}
        <View style={styles.navigationToggle}>
          <Text style={styles.navigationToggleText}>Navigation</Text>
          <Switch
            value={navigationEnabled}
            onValueChange={setNavigationEnabled}
            trackColor={{ false: Colors.light.disabled, true: Colors.light.primary }}
            thumbColor={Colors.light.background}
          />
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
            {/* Delivery Info Header */}
            <View style={styles.deliveryInfoHeader}>
              <Text style={styles.sectionTitle}>{deliveryInfoHeader.sectionTitle}</Text>
              <Badge 
                label={getDeliveryStatus()} 
                variant={getStatusBadgeVariant() as any}
                size="small"
              />
            </View>

            {/* Location Display */}
            <View style={styles.locationDisplayContainer}>
              {!isPickupCompleted ? (
                <>
                  <TouchableOpacity 
                    style={styles.locationRow}
                    onPress={() => setShowDropoffDetails(!showDropoffDetails)}
                  >
                    <Text style={styles.locationLabel}>PickUp:</Text>
                    <Text style={styles.locationText} numberOfLines={1}>
                      {currentDelivery.pickupLocation}
                    </Text>
                    <Text style={styles.expandText}>→ tap to expand</Text>
                    {showDropoffDetails ? (
                      <ChevronDown size={16} color={Colors.light.primary} />
                    ) : (
                      <ChevronRight size={16} color={Colors.light.primary} />
                    )}
                  </TouchableOpacity>
                  
                  {showDropoffDetails && (
                    <View style={styles.locationRow}>
                      <Text style={styles.locationLabel}>DropOff:</Text>
                      <Text style={styles.locationText} numberOfLines={1}>
                        {currentDelivery.dropoffLocation}
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.locationRow}>
                  <Text style={styles.locationLabel}>DropOff:</Text>
                  <Text style={styles.locationText} numberOfLines={1}>
                    {currentDelivery.dropoffLocation}
                  </Text>
                </View>
              )}
              
              {/* Route Info */}
              {routeDistance && routeDuration && (
                <View style={styles.routeInfoContainer}>
                  <View style={styles.routeInfoItem}>
                    <MapPin size={14} color={Colors.light.primary} />
                    <Text style={styles.routeInfoText}>{routeDistance}</Text>
                  </View>
                  <View style={styles.routeInfoItem}>
                    <Clock size={14} color={Colors.light.primary} />
                    <Text style={styles.routeInfoText}>{routeDuration}</Text>
                  </View>
                </View>
              )}
            </View>
            {/* Client Info */}
            <Card style={styles.clientInfoCard}>
              <View style={styles.clientHeader}>
                <View style={styles.clientDetails}>
                  <Text style={styles.clientName}>
                    {currentDelivery.ClientDetails?.smeName || currentDelivery.clientName}
                  </Text>
                  <Text style={styles.clientType}>
                    {currentDelivery.ClientDetails?.businessIndustry || currentDelivery.clientType}
                  </Text>
                </View>
                <View style={styles.clientActions}>
                  <TouchableOpacity style={styles.clientActionButton}>
                    <Phone size={16} color={Colors.light.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.clientActionButton}>
                    <MessageSquare size={16} color={Colors.light.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.routeInfo}>
                <View style={styles.routeRow}>
                  <MapPin size={14} color={Colors.light.primary} />
                  <Text style={styles.routeText}>
                    {currentDelivery.pickupLocation} → {currentDelivery.dropoffLocation}
                  </Text>
                </View>
                <View style={styles.estimateRow}>
                  <Clock size={14} color={Colors.light.placeholder} />
                  <Text style={styles.estimateText}>{currentDelivery.estimate}</Text>
                </View>
              </View>
            </Card>

            {/* Delivery Stepper */}
            <TouchableOpacity 
              onPress={() => {
                setStepperExpanded(!stepperExpanded);
                snapToPosition(stepperExpanded ? SNAP_POINTS.PARTIAL : SNAP_POINTS.EXPANDED);
              }}
              activeOpacity={1}
            >
              <DeliveryStepper 
                onStepComplete={handleStepComplete}
                currentStep={currentStep}
                isCompleted={isDeliveryCompleted}
                deliveryId={currentDelivery?.id}
                deliveryData={currentDelivery}
                expanded={stepperExpanded}
              />
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Map touch overlay to collapse stepper */}
      {stepperExpanded && (
        <TouchableOpacity
          style={styles.mapTouchOverlay}
          onPress={() => {
            setStepperExpanded(false);
            snapToPosition(SNAP_POINTS.PARTIAL);
          }}
          activeOpacity={1}
        />
      )}

      <NotificationPanel
        visible={showNotificationPanel}
        onClose={() => setShowNotificationPanel(false)}
        notifications={mapNotifications}
        onNotificationRead={markAsRead}
        title="Map Notifications"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.lg,
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapTouchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: screenHeight * 0.25, // Above the collapsed stepper
    zIndex: 0,
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
  mapHeaderLeft: {
    flex: 1,
  },
  mapHeaderTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
  },
  mapHeaderSubtitle: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
  },
  mapHeaderRight: {
    marginLeft: SPACING.md,
  },
  navigationToggle: {
    position: 'absolute',
    top: SPACING.lg + 80,
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    ...SHADOWS.light,
    zIndex: 1,
  },
  navigationToggleText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
    marginRight: SPACING.sm,
  },
  emptyMapContainer: {
    flex: 1,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: Colors.light.card,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  mapPlaceholderText: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.lg,
    color: Colors.light.text,
    marginTop: SPACING.md,
  },
  mapPlaceholderSubtext: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
    textAlign: 'center',
    marginTop: SPACING.sm,
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
  deliveryInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
  },
  clientInfoCard: {
    marginBottom: SPACING.lg,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
  },
  clientType: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
  },
  clientActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  clientActionButton: {
    padding: SPACING.sm,
    backgroundColor: Colors.light.background,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  routeInfo: {
    gap: SPACING.xs,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  estimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estimateText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
    marginLeft: SPACING.xs,
  },
  locationDisplayContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  locationLabel: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    minWidth: 70,
  },
  locationText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
    flex: 1,
    marginLeft: SPACING.sm,
  },
  expandText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.placeholder,
    marginLeft: SPACING.sm,
    fontStyle: 'italic',
  },
  routeLoader: {
    marginLeft: SPACING.sm,
  },
  routeInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  routeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  routeInfoText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
  },
});