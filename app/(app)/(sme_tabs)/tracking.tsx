import { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, TouchableOpacity, 
  Animated, PanResponder, Dimensions, Platform 
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { ArrowLeft, Phone, MessageSquare, Navigation, MapPin, Clock, Package } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useDelivery } from '../../../contexts/DeliveryContext';

const { height: screenHeight } = Dimensions.get('window');

const SNAP_POINTS = {
  COLLAPSED: screenHeight * 0.25,
  EXPANDED: screenHeight * 0.6,
};

export default function TrackingScreen() {
  const { deliveryId } = useLocalSearchParams();
  const { getDeliveryById, updateDriverLocation } = useDelivery() || {};
  const [delivery, setDelivery] = useState(getDeliveryById(deliveryId as string));
  const [bottomSheetHeight, setBottomSheetHeight] = useState(SNAP_POINTS.COLLAPSED);

  // Bottom sheet animation
  const bottomSheetAnim = useRef(new Animated.Value(SNAP_POINTS.COLLAPSED)).current;
  const panY = useRef(new Animated.Value(0)).current;

  // Simulate real-time driver location updates
  useEffect(() => {
    if (!delivery || !delivery.CourierDetails?.CourierCoordinates) return;

    const interval = setInterval(() => {
      const currentLocation = delivery.CourierDetails!.CourierCoordinates!;
      const targetLocation = delivery.tracker?.pickup === 'completed' 
        ? delivery.dropoffCord 
        : delivery.pickupCord;

      // Simulate movement towards target
      const newLocation = {
        latitude: currentLocation.latitude + (targetLocation.latitude - currentLocation.latitude) * 0.01,
        longitude: currentLocation.longitude + (targetLocation.longitude - currentLocation.longitude) * 0.01,
        latitudeDelta: 0.0422,
        longitudeDelta: 0.0421,
      };

      updateDriverLocation(delivery.id, newLocation);
      setDelivery(getDeliveryById(delivery.id));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [delivery?.id]);

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
        bottomSheetHeight + dy <= SNAP_POINTS.EXPANDED
      ) {
        panY.setValue(dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      const currentHeight = bottomSheetHeight + gestureState.dy;
      const targetSnapPoint = currentHeight < (SNAP_POINTS.COLLAPSED + SNAP_POINTS.EXPANDED) / 2
        ? SNAP_POINTS.COLLAPSED
        : SNAP_POINTS.EXPANDED;

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

  if (!delivery) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delivery Not Found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getDeliveryStatus = () => {
    if (!delivery.tracker) return 'Waiting for pickup';
    
    const { pickup, dropoff } = delivery.tracker;
    
    if (dropoff === 'completed') return 'Delivered';
    if (pickup === 'completed') return 'In transit to destination';
    return 'En route to pickup';
  };

  const getCurrentTarget = () => {
    if (!delivery.tracker || delivery.tracker.pickup === 'pending') {
      return {
        coordinates: delivery.pickupCord,
        address: delivery.pickup,
        type: 'pickup'
      };
    }
    
    return {
      coordinates: delivery.dropoffCord,
      address: delivery.dropoff,
      type: 'dropoff'
    };
  };

  const currentTarget = getCurrentTarget();

  // Create route polyline if driver location exists
  const routeCoordinates = delivery.driverLocation ? [
    {
      latitude: delivery.driverLocation.latitude,
      longitude: delivery.driverLocation.longitude,
    },
    {
      latitude: currentTarget.coordinates.latitude,
      longitude: currentTarget.coordinates.longitude,
    }
  ] : [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Delivery</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Phone size={20} color={Colors.light.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MessageSquare size={20} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        region={delivery.CourierDetails?.CourierCoordinates || currentTarget.coordinates}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {/* Driver Location Marker */}
        {delivery.CourierDetails?.CourierCoordinates && (
          <Marker
            coordinate={delivery.CourierDetails.CourierCoordinates}
            title="Driver Location"
            description={delivery.CourierDetails.CourierName}
            pinColor={Colors.light.primary}
          />
        )}

        {/* Pickup Location Marker */}
        <Marker
          coordinate={delivery.pickupCord}
          title="Pickup Location"
          description={delivery.pickupLocation}
          pinColor={delivery.tracker?.pickup === 'completed' ? Colors.light.success : Colors.light.warning}
        />

        {/* Dropoff Location Marker */}
        <Marker
          coordinate={delivery.dropoffCord}
          title="Dropoff Location"
          description={delivery.dropoffLocation}
          pinColor={delivery.tracker?.dropoff === 'completed' ? Colors.light.success : Colors.light.error}
        />

        {/* Route Polyline */}
        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={Colors.light.primary}
            strokeWidth={3}
            lineDashPattern={[5, 5]}
          />
        )}
      </MapView>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            height: bottomSheetAnim,
            transform: [{ translateY: panY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.dragHandle} />
        
        <View style={styles.bottomSheetContent}>
          {/* Delivery Status */}
          <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>Delivery Status</Text>
            <Badge 
              label={getDeliveryStatus()} 
              variant={delivery.tracker?.dropoff === 'completed' ? 'success' : 'warning'}
            />
          </View>

          {/* Package Info */}
          <Card style={styles.packageCard}>
            <View style={styles.packageHeader}>
              <Package size={20} color={Colors.light.primary} />
              <Text style={styles.packageTitle}>
                {delivery.PackageDetails?.packageDescription || 'Package Details'}
              </Text>
            </View>
            <Text style={styles.packageDescription}>
              {delivery.PackageDetails?.packageDescription || 'No description available'}
            </Text>
            <Text style={styles.trackingNumber}>
              Tracking: #{delivery.id.slice(-6).toUpperCase()}
            </Text>
          </Card>

          {/* Driver Info */}
          {delivery.CourierDetails?.CourierName && (
            <Card style={styles.driverCard}>
              <View style={styles.driverHeader}>
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>{delivery.CourierDetails.CourierName}</Text>
                  <Text style={styles.driverRole}>Your Driver</Text>
                </View>
                <View style={styles.driverActions}>
                  <TouchableOpacity style={styles.contactButton}>
                    <Phone size={16} color={Colors.light.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.contactButton}>
                    <MessageSquare size={16} color={Colors.light.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          )}

          {/* Route Info */}
          <View style={styles.routeInfo}>
            <View style={styles.routeStep}>
              <View style={[
                styles.routeIcon,
                { backgroundColor: delivery.tracker?.pickup === 'completed' ? Colors.light.success : Colors.light.warning }
              ]}>
                <MapPin size={12} color={Colors.light.background} />
              </View>
              <View style={styles.routeDetails}>
                <Text style={styles.routeLabel}>Pickup</Text>
                <Text style={styles.routeAddress}>{delivery.pickupLocation}</Text>
              </View>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.routeStep}>
              <View style={[
                styles.routeIcon,
                { backgroundColor: delivery.tracker?.dropoff === 'completed' ? Colors.light.success : Colors.light.placeholder }
              ]}>
                <Package size={12} color={Colors.light.background} />
              </View>
              <View style={styles.routeDetails}>
                <Text style={styles.routeLabel}>Dropoff</Text>
                <Text style={styles.routeAddress}>{delivery.dropoffLocation}</Text>
              </View>
            </View>
          </View>

          {/* ETA */}
          <View style={styles.etaContainer}>
            <Clock size={16} color={Colors.light.placeholder} />
            <Text style={styles.etaText}>
              Estimated delivery: {delivery.estimate.split('|')[1]?.trim() || '30 minutes'}
            </Text>
          </View>
        </View>
      </Animated.View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: Colors.light.background,
    ...SHADOWS.light,
    zIndex: 1,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.lg,
    color: Colors.light.text,
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.xs,
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
    paddingBottom: SPACING.xl,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statusTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.lg,
    color: Colors.light.text,
  },
  packageCard: {
    marginBottom: SPACING.md,
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  packageTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    marginLeft: SPACING.sm,
  },
  packageDescription: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
    marginBottom: SPACING.xs,
  },
  trackingNumber: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.primary,
  },
  driverCard: {
    marginBottom: SPACING.md,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
  },
  driverRole: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
  },
  driverActions: {
    flexDirection: 'row',
  },
  contactButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
    backgroundColor: Colors.light.background,
    borderRadius: BORDER_RADIUS.sm,
  },
  routeInfo: {
    marginBottom: SPACING.md,
  },
  routeStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  routeDetails: {
    flex: 1,
  },
  routeLabel: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
  },
  routeAddress: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.placeholder,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: Colors.light.border,
    marginLeft: 11,
    marginVertical: SPACING.xs,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  etaText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
    marginLeft: SPACING.xs,
  },
});