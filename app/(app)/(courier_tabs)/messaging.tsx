import { useState } from 'react';
import { useEffect } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, FlatList, TouchableOpacity, 
  TextInput, Image, ScrollView 
} from 'react-native';
import { Search, Phone, MessageSquare, Users, Shield } from 'lucide-react-native';
import { useLocalSearchParams, Linking } from 'expo-router';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { mockChats } from '@/data/mockData';
import { ChatComponent } from '@/components/ui/ChatComponent';

export default function CourierMessagingScreen() {
  const params = useLocalSearchParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState(mockChats);
  const [activeTab, setActiveTab] = useState<'clients' | 'immigration'>('clients');
  const [showChat, setShowChat] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
    phone?: string;
    avatar?: string;
    deliveryId?: string;
  } | null>(null);
  
  // Handle incoming navigation from deliveries tab
  useEffect(() => {
    if (params.openChatWithUser) {
      handleChatPress(
        params.openChatWithUser as string,
        params.userName as string,
        params.userPhone as string,
        params.userAvatar as string,
        params.deliveryId as string
      );
    }
  }, [params]);
  
  // Mock immigration officers data
  const immigrationOfficers = [
    {
      id: 'io1',
      name: 'Officer Sarah Kimani',
      region: 'Nairobi Central',
      avatar: 'https://i.ibb.co/M8JnWhy/avatar.png',
      status: 'online',
      phone: '+254712345001',
    },
    {
      id: 'io2', 
      name: 'Officer John Mwangi',
      region: 'Mombasa Coast',
      avatar: 'https://i.ibb.co/YP0NDzM/avatar-2.png',
      status: 'offline',
      phone: '+254712345002',
    },
    {
      id: 'io3',
      name: 'Officer Grace Wanjiku',
      region: 'Kisumu Western',
      avatar: 'https://i.ibb.co/VVxS579/avatar-3.png',
      status: 'online',
      phone: '+254712345003',
    },
    {
      id: 'io4',
      name: 'Officer David Kiprop',
      region: 'Eldoret Rift Valley',
      avatar: 'https://i.ibb.co/Lptzj15/avatar-4.png',
      status: 'offline',
      phone: '+254712345004',
    },
  ];
  
  const handleChatPress = (userId: string, userName: string, userPhone?: string, userAvatar?: string, deliveryId?: string) => {
    setSelectedUser({
      id: userId,
      name: userName,
      phone: userPhone,
      avatar: userAvatar,
      deliveryId,
    });
    setShowChat(true);
  };
  
  const handlePhoneCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };
  
  const renderChatItem = ({ item }: { item: typeof mockChats[0] }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => handleChatPress(item.id, item.name, '+254712345678', item.avatar)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.online && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.username}>{item.name}</Text>
          <Text style={styles.timestamp}>{item.lastMessageTime}</Text>
        </View>
        
        <View style={styles.chatPreview}>
          <Text 
            style={[styles.lastMessage, !item.read && styles.unreadMessage]} 
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {!item.read && <View style={styles.unreadBadge}><Text style={styles.unreadCount}>{item.unreadCount}</Text></View>}
        </View>
      </View>
    </TouchableOpacity>
  );
  
  const renderImmigrationOfficer = ({ item }: { item: typeof immigrationOfficers[0] }) => (
    <TouchableOpacity style={styles.officerItem}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={[
          styles.statusIndicator,
          { backgroundColor: item.status === 'online' ? Colors.light.success : Colors.light.placeholder }
        ]} />
      </View>
      
      <View style={styles.officerContent}>
        <Text style={styles.officerName}>{item.name}</Text>
        <Text style={styles.officerRegion}>{item.region}</Text>
        <Text style={styles.officerStatus}>
          {item.status === 'online' ? 'Available' : 'Offline'}
        </Text>
      </View>
      
      <View style={styles.officerActions}>
        <TouchableOpacity 
          style={styles.officerActionButton}
          onPress={() => handlePhoneCall(item.phone)}
        >
          <Phone size={18} color={Colors.light.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.officerActionButton}
          onPress={() => handleChatPress(item.id, item.name, item.phone, item.avatar)}
        >
          <MessageSquare size={18} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Meccssages</Text>
          <Text style={styles.headerSubtitle}>Chat with your clients</Text>
        </View>
        
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'clients' && styles.activeTab]}
          onPress={() => setActiveTab('clients')}
        >
          <Users size={16} color={activeTab === 'clients' ? Colors.light.background : Colors.light.text} />
          <Text style={[styles.tabText, activeTab === 'clients' && styles.activeTabText]}>
            Clients ({chats.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'immigration' && styles.activeTab]}
          onPress={() => setActiveTab('immigration')}
        >
          <Shield size={16} color={activeTab === 'immigration' ? Colors.light.background : Colors.light.text} />
          <Text style={[styles.tabText, activeTab === 'immigration' && styles.activeTabText]}>
            Immigration Officers
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.light.placeholder} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={activeTab === 'clients' ? "Search conversations" : "Search officers"}
            placeholderTextColor={Colors.light.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      
      {activeTab === 'clients' ? (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chatsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={immigrationOfficers}
          renderItem={renderImmigrationOfficer}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chatsList}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Chat Component */}
      {selectedUser && (
        <ChatComponent
          visible={showChat}
          onClose={() => {
            setShowChat(false);
            setSelectedUser(null);
          }}
          userId={selectedUser.id}
          userName={selectedUser.name}
          userPhone={selectedUser.phone}
          userAvatar={selectedUser.avatar}
          deliveryId={selectedUser.deliveryId}
        />
      )}
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
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: Colors.light.card,
    gap: SPACING.xs,
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
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 40,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    height: '100%',
  },
  chatsList: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  chatItem: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.success,
    borderWidth: 2,
    borderColor: Colors.light.background,
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
  },
  timestamp: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.placeholder,
  },
  chatPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
  },
  unreadMessage: {
    fontFamily: FONT.medium,
    color: Colors.light.text,
  },
  unreadBadge: {
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  officerItem: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    alignItems: 'center',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.light.background,
  },
  officerContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  officerName: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    marginBottom: 2,
  },
  officerRegion: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
    marginBottom: 2,
  },
  officerStatus: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.success,
  },
  officerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  officerActionButton: {
    padding: SPACING.sm,
    backgroundColor: Colors.light.background,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  unreadCount: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.background,
  },
});