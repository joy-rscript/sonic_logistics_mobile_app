import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, 
  FlatList 
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Bell, ChevronRight, MapPin, Clock, Package, Navigation } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';
import { CircleUser as UserCircle, Truck } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useDelivery } from '@/contexts/DeliveryContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationPanel } from '@/components/ui/NotificationPanel';

const NotificationBell = ({ hasUnread, onPress }: { hasUnread: boolean; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.notificationButton}>
    <Bell size={24} color={Colors.light.text} />
    {hasUnread && (
      <View style={styles.notificationBadge}>
        <Text style={styles.notificationBadgeText}>!</Text>
      </View>
    )}
  </TouchableOpacity>
);

export default function CourierHomeScreen() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const { 
    allDeliveries, 
    acceptDelivery,
    loading: deliveryLoading,
    error: deliveryError,
    refreshDeliveries
  } = useDelivery();

  const { 
    notifications, 
    unreadCount, 
    markAsRead,
    refreshNotifications 
  } = useNotifications();

  const [selectedDelivery, setSelectedDelivery] = useState(
    allDeliveries.length > 0 ? allDeliveries[0] : null
  }, [currentStep, currentDelivery]);

  // Set up location and keyboard listeners
  useEffect(() => {
    // Refresh data when component mounts
      keyboardDidHideListener.remove();
    };
  const handleNotificationRead = (id: string) => {
    markAsRead(id);
  };

  const handleAcceptDelivery = (requestId: string) => {
    acceptDelivery(requestId);
    router.replace('/(app)/(courier_tabs)/deliveries');
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi Martin,</Text>
            <Text style={styles.subGreeting}>Ready for deliveries?</Text>
          </View>
          <TouchableOpacity onPress={() => setShowNotifications(prev => !prev)} style={styles.notificationButton}>
            <Bell size={24} color={Colors.light.text} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {showNotifications && (
          <View style={styles.notificationsOverlay}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            {deliveryLoading && (
              <Text style={styles.loadingText}>Loading notifications...</Text>
            )}
            {deliveryError && (
              <Text style={styles.errorText}>{deliveryError}</Text>
            )}
            {notifications.map(notification => (
              <TouchableOpacity 
                key={notification.id} 
                style={[styles.notificationCard, notification.read && styles.notificationCardRead]}
                onPress={() => handleNotificationRead(notification.id)}
              >
                <View style={[styles.notificationIcon, { backgroundColor: notification.type === 'system' ? '#4CAF50' : notification.type === 'update' ? '#2196F3' : '#FFC107' }]}>
                  <Text style={styles.notificationIconText}>
                    {notification.type === 'system' ? 'S' : notification.type === 'update' ? 'U' : 'D'}
                  </Text>
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
                      {showInstructions ? 'Hide Instructions' : 'View Instructions'}
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
        ) : !showNotifications ? (
          <View style={styles.emptyState}>
            <Package size={64} color={Colors.light.placeholder} />
            <Text style={styles.emptyStateTitle}>No Available Deliveries</Text>
            <Text style={styles.emptyStateText}>
              New delivery requests will appear here when available
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Notification Panel */}
      <NotificationPanel 
        visible={showNotificationPanel}
        onClose={() => setShowNotificationPanel(false)}
      />
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
    minHeight: 16,
    minWidth: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: Colors.light.background,
    fontSize: 10,
    fontFamily: FONT.bold,
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
  loadingText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
    textAlign: 'center',
    marginVertical: SPACING.md,
  },
  errorText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.error,
    textAlign: 'center',
    marginVertical: SPACING.md,
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