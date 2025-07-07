import { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Search, Filter } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface Shipment {
  id: string;
  trackingNumber: string;
  destination: string;
  origin: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  amount: number;
  date: string;
  courier: string;
}

export default function SMEShipmentsScreen() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in_transit' | 'delivered'>('all');
  
  const shipments: Shipment[] = [
    {
      id: '1',
      trackingNumber: 'SL001234',
      destination: 'Nairobi CBD',
      origin: 'Westlands',
      status: 'in_transit',
      amount: 450,
      date: '2024-01-15',
      courier: 'John Doe',
    },
    {
      id: '2',
      trackingNumber: 'SL001235',
      destination: 'Mombasa',
      origin: 'Nairobi',
      status: 'delivered',
      amount: 1200,
      date: '2024-01-14',
      courier: 'Jane Smith',
    },
    {
      id: '3',
      trackingNumber: 'SL001236',
      destination: 'Kisumu',
      origin: 'Nairobi',
      status: 'pending',
      amount: 800,
      date: '2024-01-16',
      courier: 'Pending Assignment',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'in_transit': return 'warning';
      case 'pending': return 'secondary';
      case 'cancelled': return 'error';
      default: return 'primary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const filteredShipments = activeTab === 'all' 
    ? shipments 
    : shipments.filter(s => s.status === activeTab);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Shipments</Text>
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
        {['all', 'pending', 'in_transit', 'delivered'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.shipmentsList}>
        {filteredShipments.map((shipment) => (
          <Card key={shipment.id} style={styles.shipmentCard}>
            <View style={styles.shipmentHeader}>
              <Text style={styles.trackingNumber}>{shipment.trackingNumber}</Text>
              <Badge 
                label={getStatusLabel(shipment.status)} 
                variant={getStatusColor(shipment.status) as any}
              />
            </View>
            
            <View style={styles.routeContainer}>
              <Text style={styles.routeText}>
                {shipment.origin} → {shipment.destination}
              </Text>
            </View>
            
            <View style={styles.shipmentFooter}>
              <View>
                <Text style={styles.courierText}>Courier: {shipment.courier}</Text>
                <Text style={styles.dateText}>{shipment.date}</Text>
              </View>
              <Text style={styles.amountText}>KSh {shipment.amount}</Text>
            </View>
          </Card>
        ))}
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
  shipmentsList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  shipmentCard: {
    marginBottom: SPACING.md,
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
  routeContainer: {
    marginBottom: SPACING.sm,
  },
  routeText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
  },
  shipmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  courierText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.placeholder,
  },
  dateText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.placeholder,
  },
  amountText: {
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.md,
    color: Colors.light.primary,
  },
});