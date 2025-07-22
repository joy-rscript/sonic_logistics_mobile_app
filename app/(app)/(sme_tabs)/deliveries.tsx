import { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Search, Filter, MapPin, User, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useDelivery } from '@/contexts/DeliveryContext';

export default function SMEDeliveriesScreen() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');
  const { smeDeliveries } = useDelivery();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'accepted': return 'warning';
      case 'pending': return 'secondary';
      case 'cancelled': return 'error';
      default: return 'primary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted': return 'Accepted';
      case 'completed': return 'Delivered';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const filteredDeliveries = activeTab === 'all' 
    ? smeDeliveries 
    : smeDeliveries.filter(s => s.status === activeTab);

  const handleDeliveryPress = (delivery: any) => {
    if (delivery.status === 'accepted' && delivery.driverId) {
      // Navigate to tracking screen
      router.push({
        pathname: '/(app)/(sme_tabs)/tracking',
        params: { deliveryId: delivery.id }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Deliveries</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Search size={20} color={Colors.light.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Filter size={20} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        {['all', 'pending', 'accepted', 'completed'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.DeliveriesList}>
        {filteredDeliveries.map((shipment) => (
          <TouchableOpacity 
            key={shipment.id} 
            onPress={() => handleDeliveryPress(shipment)}
          >
            <Card style={styles.shipmentCard}>
              <View style={styles.shipmentHeader}>
                <Text style={styles.trackingNumber}>#{shipment.id.slice(-6).toUpperCase()}</Text>
                <Badge 
                  label={getStatusLabel(shipment.status)} 
                  variant={getStatusColor(shipment.status) as any}
                />
              </View>
              
              <View style={styles.packageInfo}>
                <Text style={styles.packageName}>{shipment.packageName || 'Package'}</Text>
                <Text style={styles.packageDescription}>
                  {shipment.packageDescription || 'No description'}
                </Text>
              </View>

              <View style={styles.routeContainer}>
                <View style={styles.routeRow}>
                  <MapPin size={16} color={Colors.light.primary} />
                  <Text style={styles.routeText}>
                    {shipment.pickup} → {shipment.dropoff}
                  </Text>
                </View>
              </View>

              {shipment.status === 'accepted' && shipment.driverName && (
                <View style={styles.driverInfo}>
                  <User size={16} color={Colors.light.success} />
                  <Text style={styles.driverText}>Driver: {shipment.driverName}</Text>
                  <TouchableOpacity style={styles.trackButton}>
                    <Text style={styles.trackButtonText}>Track Live</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              <View style={styles.shipmentFooter}>
                <View style={styles.timeInfo}>
                  <Clock size={14} color={Colors.light.placeholder} />
                  <Text style={styles.dateText}>
                    {shipment.acceptedAt 
                      ? `Accepted: ${shipment.acceptedAt.toLocaleDateString()}`
                      : 'Created today'
                    }
                  </Text>
                </View>
                <Text style={styles.amountText}>KSh {shipment.price}</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        {filteredDeliveries.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No Deliveries found</Text>
            <Text style={styles.emptyStateText}>
              {activeTab === 'all' 
                ? 'Create your first delivery request to get started'
                : `No ${activeTab} Deliveries at the moment`
              }
            </Text>
          </View>
        )}
      </ScrollView>
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
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  tab: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: Colors.light.card,
  },
  activeTab: {
    backgroundColor: Colors.light.primary,
  },
  tabText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
  },
  activeTabText: {
    color: Colors.light.background,
  },
  DeliveriesList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  shipmentCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  shipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  trackingNumber: {
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
  },
  packageInfo: {
    marginBottom: SPACING.sm,
  },
  packageName: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    marginBottom: 2,
  },
  packageDescription: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
  },
  routeContainer: {
    marginBottom: SPACING.sm,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
    marginLeft: SPACING.xs,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.light.success}10`,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  driverText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.success,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  trackButton: {
    backgroundColor: Colors.light.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  trackButtonText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.background,
  },
  shipmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.placeholder,
    marginLeft: SPACING.xs,
  },
  amountText: {
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.md,
    color: Colors.light.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyStateTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.lg,
    color: Colors.light.text,
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