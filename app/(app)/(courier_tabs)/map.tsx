import { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { Navigation, MapPin, Clock } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { Card } from '@/components/ui/Card';
import { NotificationBell } from '@/components/ui/NotificatonBell';
import { useNotificationsByType } from '@/contexts/NotificationContext';
import { NotificationPanel } from '@/components/ui/NotificationPanel';

export default function CourierMapScreen() {
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  
  // Use map-specific notifications
  const { 
    notifications: mapNotifications, 
    unreadCount: mapUnreadCount, 
    markAsRead,
    refreshNotifications 
  } = useNotificationsByType('map');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Delivery Map</Text>
          <Text style={styles.headerSubtitle}>Navigate to your destinations</Text>
        </View>
        <NotificationBell 
          hasUnread={mapUnreadCount > 0}
          onPress={() => setShowNotificationPanel(true)}
        />
      </View>

      {/* Map placeholder - In a real app, you'd use react-native-maps */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <MapPin size={48} color={Colors.light.primary} />
          <Text style={styles.mapPlaceholderText}>Map View</Text>
          <Text style={styles.mapPlaceholderSubtext}>
            Interactive map with delivery locations would appear here
          </Text>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <Card style={styles.activeDeliveryCard}>
          <View style={styles.deliveryHeader}>
            <Text style={styles.deliveryTitle}>Active Delivery</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>In Progress</Text>
            </View>
          </View>
          
          <View style={styles.deliveryDetails}>
            <View style={styles.locationRow}>
              <MapPin size={16} color={Colors.light.primary} />
              <Text style={styles.locationText}>Westlands → Nairobi CBD</Text>
            </View>
            
            <View style={styles.timeRow}>
              <Clock size={16} color={Colors.light.placeholder} />
              <Text style={styles.timeText}>ETA: 15 minutes</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.navigationButton}>
            <Navigation size={20} color={Colors.light.background} />
            <Text style={styles.navigationButtonText}>Start Navigation</Text>
          </TouchableOpacity>
        </Card>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.xl,
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: Colors.light.placeholder,
  },
  mapContainer: {
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
  bottomContainer: {
    padding: SPACING.lg,
  },
  activeDeliveryCard: {
    marginBottom: SPACING.md,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  deliveryTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
  },
  statusBadge: {
    backgroundColor: Colors.light.warning,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.pill,
  },
  statusText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.background,
  },
  deliveryDetails: {
    marginBottom: SPACING.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  locationText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
    marginLeft: SPACING.xs,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
    marginLeft: SPACING.xs,
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  navigationButtonText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.background,
    marginLeft: SPACING.sm,
  },
});