import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Bell, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { mockDeliveries } from '@/data/mockData';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'update' | 'delivery';
  read: boolean;
}

export default function HomeScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Application Updates',
      message: 'The Sonic App will be having updates for the system so all Sonic Africa application features will not be available.',
      type: 'update',
      read: false,
    },
    {
      id: '2',
      title: 'Client Delivery Pending',
      message: 'Pickup pick up for Marembo is pending',
      type: 'delivery',
      read: false,
    },
  ]);

  const [pendingDeliveries, setPendingDeliveries] = useState(mockDeliveries.filter(d => d.status === 'pending'));
  
  const handleNotificationRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? {...notif, read: true} : notif
      )
    );
  };

  const handleViewAllDeliveries = () => {
    router.push('/(app)/(tabs)/deliveries');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi Martin,</Text>
            <Text style={styles.subGreeting}>Welcome back</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color={Colors.light.text} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        <View style={styles.notificationsContainer}>
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

        <View style={styles.deliveriesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Deliveries</Text>
            <TouchableOpacity onPress={handleViewAllDeliveries}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          {pendingDeliveries.length > 0 ? (
            pendingDeliveries.slice(0, 3).map(delivery => (
              <Card key={delivery.id} style={styles.deliveryCard}>
                <View style={styles.deliveryHeader}>
                  <View style={styles.deliveryInfo}>
                    <Text style={styles.deliveryLocation}>
                      Package in: {delivery.location}
                    </Text>
                    <Badge label="Premium" />
                  </View>
                  <Text style={styles.deliveryPrice}>${delivery.price}</Text>
                </View>
                
                <View style={styles.clientSection}>
                  <Image 
                    source={{ uri: 'https://i.ibb.co/M8JnWhy/avatar.png' }} 
                    style={styles.clientImage}
                  />
                  <View>
                    <Text style={styles.clientName}>{delivery.clientName}</Text>
                    <Text style={styles.clientRole}>{delivery.clientType}</Text>
                  </View>
                  <Badge label="Premium" style={styles.clientBadge} />
                </View>

                <View style={styles.deliveryDetails}>
                  <Text style={styles.detailsTitle}>Request Details</Text>
                  <View style={styles.badgeContainer}>
                    <Badge label="Premium" />
                    <Badge label="Cold chain" style={styles.coldChainBadge} />
                    <Badge label="Perishables" style={styles.perishablesBadge} />
                  </View>
                </View>

                <TouchableOpacity style={styles.acceptButton}>
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
              </Card>
            ))
          ) : (
            <Text style={styles.noDeliveriesText}>No pending deliveries</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
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
  notificationsContainer: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.lg,
    color: Colors.light.text,
    marginBottom: SPACING.md,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
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
  deliveriesContainer: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  viewAllText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.primary,
  },
  deliveryCard: {
    marginBottom: SPACING.lg,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryLocation: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
    marginRight: SPACING.sm,
  },
  deliveryPrice: {
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
  },
  clientSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  clientImage: {
    height: 40,
    width: 40,
    borderRadius: 20,
    marginRight: SPACING.md,
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
  clientBadge: {
    marginLeft: 'auto',
  },
  deliveryDetails: {
    marginVertical: SPACING.md,
  },
  detailsTitle: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    marginBottom: SPACING.sm,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  coldChainBadge: {
    marginLeft: SPACING.xs,
    backgroundColor: '#E3F2FD',
  },
  perishablesBadge: {
    marginLeft: SPACING.xs,
    backgroundColor: '#FFF8E1',
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
  noDeliveriesText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: Colors.light.placeholder,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});