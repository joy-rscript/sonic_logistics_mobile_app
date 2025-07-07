import { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Clock } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';
import { mockDeliveries } from '@/data/mockData';

export default function DeliveriesScreen() {
  const [activeTab, setActiveTab] = useState('ongoing');
  const [deliveries, setDeliveries] = useState(
    mockDeliveries.filter(d => activeTab === 'ongoing' 
      ? d.status === 'ongoing' 
      : d.status === 'completed')
  );
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setDeliveries(
      mockDeliveries.filter(d => tab === 'ongoing' 
        ? d.status === 'ongoing' || d.status === 'pending'
        : d.status === 'completed')
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Deliveries</Text>
        <TouchableOpacity>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>i</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'ongoing' && styles.activeTab]} 
          onPress={() => handleTabChange('ongoing')}
        >
          <Text style={[styles.tabText, activeTab === 'ongoing' && styles.activeTabText]}>
            Ongoing
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'past' && styles.activeTab]} 
          onPress={() => handleTabChange('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.deliveriesList}>
        {deliveries.length > 0 ? (
          deliveries.map((delivery, index) => (
            <TouchableOpacity key={delivery.id} style={styles.deliveryItem}>
              <View style={styles.deliveryHeader}>
                <Text style={styles.dateText}>
                  {delivery.date}
                </Text>
                <Text style={styles.priceText}>${delivery.price}</Text>
              </View>
              
              <View style={styles.timeContainer}>
                <Clock size={14} color={Colors.light.placeholder} />
                <Text style={styles.timeText}>{delivery.time}</Text>
              </View>
              
              <View style={styles.routeContainer}>
                <View style={styles.locationDot} />
                <View style={styles.locationLine} />
                <View style={styles.destinationDot} />
                
                <View style={styles.locationTextContainer}>
                  <Text style={styles.fromText}>from {delivery.from}</Text>
                  <Text style={styles.toText}>to {delivery.to}</Text>
                </View>
              </View>

              {index < deliveries.length - 1 && <View style={styles.divider} />}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No deliveries found</Text>
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
  infoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIconText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
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
  deliveryItem: {
    paddingVertical: SPACING.md,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dateText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
  },
  priceText: {
    fontFamily: FONT.bold,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  timeText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.placeholder,
    marginLeft: SPACING.xs,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.primary,
  },
  locationLine: {
    width: 1,
    height: 20,
    backgroundColor: Colors.light.border,
    marginVertical: 2,
    marginLeft: 5.5,
  },
  destinationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.error,
    position: 'absolute',
    top: 36,
    left: 0,
  },
  locationTextContainer: {
    marginLeft: SPACING.md,
  },
  fromText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
    marginBottom: SPACING.md,
  },
  toText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
    marginTop: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginTop: SPACING.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xxl,
  },
  emptyStateText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.placeholder,
  },
});