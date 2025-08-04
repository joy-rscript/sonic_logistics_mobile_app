import { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Clock, MapPin, Package, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Phone, MessageSquare } from 'lucide-react-native';
import { Linking } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@/constantas/Theme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useDelivery } from '@/contexts/DeliveryContext';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { useNotificationsByType } from '@/contexts/NotificationContext';
import { NotificationPanel } from '@/components/ui/NotificationPanel';

export default function CourierDeliveriesScreen() {
  const [activeTab, setActiveTab] = useState('ongoing');
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [tappedDeliveries, setTappedDeliveries] = useState<Set<string>>(new Set());
  
  const { 
    pendingOngoingDeliveries, 
    currentDelivery, 
    setCurrentDelivery,
    updateDeliveryTracker,
    completeDelivery 
  } = useDelivery();

  const { 
    notifications: deliveryNotifications, 
    unreadCount: deliveryUnreadCount, 
    markAsRead,
    refreshNotifications 
  } = useNotificationsByType('delivery');

  const handleDeliveryPress = (delivery: any) => {
    const deliveryId = delivery.id;
    
    if (tappedDeliveries.has(deliveryId)) {
      // Second tap - redirect to map
      setCurrentDelivery(delivery);
      router.push('/(app)/(courier_tabs)/map');
    } else {
      // First tap - show alert
      setTappedDeliveries(prev => new Set(prev).add(deliveryId));
      
      Alert.alert(
        'Delivery Tracking',
        'Currently being tracked in your map.',
        [
          { text: 'OK', style: 'cancel' },
          { 
            text: 'Go to Map', 
            onPress: () => {
              setCurrentDelivery(delivery);
              router.push('/(app)/(courier_tabs)/map');
            }
          }
        ]
      );
    }
  };
  
  const handleCallClient = (delivery: any) => {
    const phoneNumber = delivery.ClientDetails?.phone || '+254712345678';
    Linking.openURL(`tel:${phoneNumber}`);
  };
  
  const handleChatWithClient = (delivery: any) => {
    // Navigate to messaging tab and trigger chat opening
    router.push({
      pathname: '/(app)/(courier_tabs)/messaging',
      params: {
        openChatWithUser: delivery.ClientDetails?.smeId || delivery.id,
        userName: delivery.ClientDetails?.smeName || delivery.clientName,
        userPhone: delivery.ClientDetails?.phone || '+254712345678',
        userAvatar: 'https://i.ibb.co/M8JnWhy/avatar.png',
        deliveryId: delivery.id,
      }
    });
  };

  const handlePickupComplete = (deliveryId: string) => {
    updateDeliveryTracker(deliveryId, {
      pickup: 'completed',
      pickupCode: '12345', 
    });
  };

  const handleDropoffComplete = (deliveryId: string) => {
    updateDeliveryTracker(deliveryId, {
      dropoff: 'completed',
      dropoffCode: '67890', 
    });
    
    // Complete the delivery
    completeDelivery(deliveryId);
  };

  const handleNotificationRead = (id: string) => {
    markAsRead(id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return Colors.light.success;
      case 'in_progress': return Colors.light.warning;
      case 'pending': return Colors.light.placeholder;
      default: return Colors.light.placeholder;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return AlertCircle;
      case 'pending': return Clock;
      default: return Clock;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Deliveries</Text>
          <Text style={styles.headerSubtitle}>Track your delivery progress</Text>
        </View>
        <NotificationBell 
          hasUnread={deliveryUnreadCount > 0}
          onPress={() => setShowNotificationPanel(true)}
        />
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'ongoing' && styles.activeTab]} 
          onPress={() => setActiveTab('ongoing')}
        >
          <Text style={[styles.tabText, activeTab === 'ongoing' && styles.activeTabText]}>
            Ongoing ({pendingOngoingDeliveries.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]} 
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.deliveriesList}>
        {activeTab === 'ongoing' && pendingOngoingDeliveries.length > 0 ? (
          pendingOngoingDeliveries.map((delivery) => {
            const isCurrentDelivery = currentDelivery?.id === delivery.id;
            const StatusIcon = getStatusIcon(delivery.tracker?.pickup || 'pending');
            
            return (
              <TouchableOpacity 
                key={delivery.id} 
                onPress={() => handleDeliveryPress(delivery)}
              >
                <Card style={[
                  styles.deliveryCard,
                  isCurrentDelivery && styles.currentDeliveryCard
                ]}>
                  <View style={styles.deliveryHeader}>
                    <View style={styles.deliveryInfo}>
                      <Text style={styles.clientName}>{delivery.ClientDetails?.smeName || delivery.clientName}</Text>
                      <Text style={styles.clientType}>{delivery.ClientDetails?.businessIndustry || delivery.clientType}</Text>
                    </View>
                    <View style={styles.headerActions}>
                      <View style={styles.priceContainer}>
                        <Text style={styles.priceText}>KSh {delivery.PackageDetails?.price || delivery.price}</Text>
                      </View>
                      <View style={styles.actionButtons}>
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleCallClient(delivery);
                          }}
                        >
                          <Phone size={16} color={Colors.light.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleChatWithClient(delivery);
                          }}
                        >
                          <MessageSquare size={16} color={Colors.light.primary} />
                        </TouchableOpacity>
                      </View>
                      {isCurrentDelivery && (
                        <Badge label="Current" variant="primary" size="small" />
                      )}
                    </View>
                  </View>

                  <View style={styles.routeContainer}>
                    <View style={styles.routeStep}>
                      <View style={[
                        styles.routeIcon,
                        { backgroundColor: getStatusColor(delivery.tracker?.pickup || 'pending') }
                      ]}>
                        <StatusIcon size={12} color={Colors.light.background} />
                      </View>
                      <View style={styles.routeInfo}>
                        <Text style={styles.routeLabel}>Pickup</Text>
                        <Text style={styles.routeAddress} numberOfLines={1}>
                          {delivery.pickupLocation || delivery.pickup}
                        </Text>
                      </View>
                      {delivery.tracker?.pickup === 'pending' && (
                        <TouchableOpacity 
                          style={styles.primaryActionButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handlePickupComplete(delivery.id);
                          }}
                        >
                          <Text style={styles.actionButtonText}>Complete</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={styles.routeLine} />

                    <View style={styles.routeStep}>
                      <View style={[
                        styles.routeIcon,
                        { backgroundColor: getStatusColor(delivery.tracker?.dropoff || 'pending') }
                      ]}>
                        <Package size={12} color={Colors.light.background} />
                      </View>
                      <View style={styles.routeInfo}>
                        <Text style={styles.routeLabel}>Drop Off</Text>
                        <Text style={styles.routeAddress} numberOfLines={1}>
                          {delivery.dropoffLocation || delivery.dropoff}
                        </Text>
                      </View>
                      {delivery.tracker?.pickup === 'completed' && delivery.tracker?.dropoff === 'pending' && (
                        <TouchableOpacity 
                          style={styles.primaryActionButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDropoffComplete(delivery.id);
                          }}
                        >
                          <Text style={styles.actionButtonText}>Complete</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  <View style={styles.deliveryFooter}>
                    <View style={styles.timeContainer}>
                      <Clock size={14} color={Colors.light.placeholder} />
                      <Text style={styles.timeText}>
                        Accepted: {delivery.acceptedAt?.toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.estimateText}>{delivery.estimate}</Text>
                  </View>

                  {isCurrentDelivery && (
                    <View style={styles.currentDeliveryIndicator}>
                      <Text style={styles.currentDeliveryText}>
                        ← This delivery is currently active on your map screen
                      </Text>
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            );
          })
        ) : activeTab === 'ongoing' ? (
          <View style={styles.emptyState}>
            <Package size={64} color={Colors.light.placeholder} />
            <Text style={styles.emptyStateTitle}>No Ongoing Deliveries</Text>
            <Text style={styles.emptyStateText}>
              Accept delivery requests from the home screen to see them here
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <CheckCircle size={64} color={Colors.light.placeholder} />
            <Text style={styles.emptyStateTitle}>No Completed Deliveries</Text>
            <Text style={styles.emptyStateText}>
              Completed deliveries will appear here
            </Text>
          </View>
        )}
      </ScrollView>
      
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    paddingHorizontal: SPACING.lg,
  },
  tab: {
    paddingVertical: SPACING.sm,
    marginRight: SPACING.xl,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.light.primary,
  },
  tabText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.placeholder,
  },
  activeTabText: {
    color: Colors.light.text,
  },
  deliveriesList: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  deliveryCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  currentDeliveryCard: {
    borderColor: Colors.light.primary,
    borderWidth: 2,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerActions: {
    alignItems: 'flex-end',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  actionButton: {
    padding: SPACING.xs,
    backgroundColor: Colors.light.background,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  deliveryInfo: {
    flex: 1,
  },
  clientName: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    marginBottom: 2,
  },
  clientType: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    marginBottom: SPACING.xs,
  },
  routeContainer: {
    marginBottom: SPACING.md,
  },
  routeStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  routeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
    marginBottom: 2,
  },
  routeAddress: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.placeholder,
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: Colors.light.border,
    marginLeft: 11,
    marginVertical: 2,
  },
  primaryActionButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  actionButtonText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.background,
  },
  deliveryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.placeholder,
    marginLeft: SPACING.xs,
  },
  estimateText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.placeholder,
  },
  currentDeliveryIndicator: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.primary,
  },
  currentDeliveryText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.primary,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: SPACING.lg,
  },
});