import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Chrome as Home, Package, MessageSquare, User, Map } from 'lucide-react-native';
import { View } from 'react-native';
import Colors from '@/constants/Colors';
import { FONT, FONT_SIZE } from '@/constants/Theme';
import { useColorScheme } from 'react-native';
import { TabBarBadge } from '@/components/ui/TabBarBadge';
import { useNotifications } from '@/contexts/NotificationContext';
import { useDelivery } from '@/contexts/DeliveryContext';
import { useChat } from '@/contexts/ChatContext';

export default function CourierTabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { unreadCount: notificationCount } = useNotifications();
  const { pendingOngoingDeliveries } = useDelivery();
  const { chats } = useChat();
  
  const unreadMessagesCount = chats.reduce((total, chat) => total + chat.unreadCount, 0);
  const activeDeliveriesCount = pendingOngoingDeliveries.length;

  const TabIconWithBadge = ({ 
    IconComponent, 
    color, 
    size, 
    badgeCount 
  }: { 
    IconComponent: any; 
    color: string; 
    size: number; 
    badgeCount: number; 
  }) => (
    <View style={{ position: 'relative' }}>
      <IconComponent size={size} color={color} />
      <TabBarBadge count={badgeCount} visible={badgeCount > 0} />
    </View>
  );
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <TabIconWithBadge 
              IconComponent={Home} 
              color={color} 
              size={size} 
              badgeCount={notificationCount} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="deliveries"
        options={{
          title: 'Deliveries',
          tabBarIcon: ({ color, size }) => (
            <TabIconWithBadge 
              IconComponent={Package} 
              color={color} 
              size={size} 
              badgeCount={activeDeliveriesCount} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => <Map size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messaging"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <TabIconWithBadge 
              IconComponent={MessageSquare} 
              color={color} 
              size={size} 
              badgeCount={unreadMessagesCount} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.light.card,
    borderTopColor: Colors.light.border,
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
  },
  tabBarLabel: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.xs,
  },
});