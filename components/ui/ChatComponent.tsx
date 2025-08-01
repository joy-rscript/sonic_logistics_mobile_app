import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Linking,
  Animated,
} from 'react-native';
import { ArrowLeft, Send, Plus, Camera, Mic, Phone, MoveVertical as MoreVertical, Image as ImageIcon, MapPin, Paperclip, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';
import { useChat } from '@/contexts/ChatContext';

interface ChatComponentProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userPhone?: string;
  userAvatar?: string;
  deliveryId?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'image' | 'audio' | 'location' | 'file';
  fileUrl?: string;
  imageUrl?: string;
  audioUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  read: boolean;
}

export function ChatComponent({
  visible,
  onClose,
  userId,
  userName,
  userPhone,
  userAvatar,
  deliveryId,
}: ChatComponentProps) {
  const [messageText, setMessageText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  const { 
    sendTextMessage, 
    sendImageMessage, 
    sendLocationMessage,
    loadChatHistory,
    createNewMessage,
    markChatAsRead 
  } = useChat();

  // Load chat history when component mounts
  useEffect(() => {
    if (visible && userId) {
      loadChatHistoryData();
      markChatAsRead(userId);
    }
  }, [visible, userId]);

  // Animate modal entrance
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible]);

  const loadChatHistoryData = async () => {
    setLoading(true);
    try {
      const chatHistory = await loadChatHistory(userId);
      setMessages(chatHistory);
    } catch (error) {
      console.error('Error loading chat history:', error);
      Alert.alert('Error', 'Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      const newMessage = await createNewMessage({
        recipientId: userId,
        message: messageText.trim(),
        type: 'text',
        deliveryId,
      });
      
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        const newMessage = await createNewMessage({
          recipientId: userId,
          message: 'Image',
          type: 'image',
          imageUrl: result.assets[0].uri,
          deliveryId,
        });
        
        setMessages(prev => [...prev, newMessage]);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (error) {
        Alert.alert('Error', 'Failed to send image');
      }
    }
    setShowAttachmentMenu(false);
  };

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        const newMessage = await createNewMessage({
          recipientId: userId,
          message: 'Image',
          type: 'image',
          imageUrl: result.assets[0].uri,
          deliveryId,
        });
        
        setMessages(prev => [...prev, newMessage]);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (error) {
        Alert.alert('Error', 'Failed to send image');
      }
    }
    setShowAttachmentMenu(false);
  };

  const handleSendLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant location permissions');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const newMessage = await createNewMessage({
        recipientId: userId,
        message: 'Location shared',
        type: 'location',
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        deliveryId,
      });
      
      setMessages(prev => [...prev, newMessage]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to send location');
    }
    setShowAttachmentMenu(false);
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant microphone permissions');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        const newMessage = await createNewMessage({
          recipientId: userId,
          message: 'Voice message',
          type: 'audio',
          audioUrl: uri,
          deliveryId,
        });
        
        setMessages(prev => [...prev, newMessage]);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
      
      setRecording(null);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to send voice message');
    }
  };

  const handleVoicePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handlePhoneCall = () => {
    if (userPhone) {
      Linking.openURL(`tel:${userPhone}`);
    } else {
      Alert.alert('No Phone Number', 'Phone number not available for this contact');
    }
  };

  const formatMessageTime = (timestamp: Date) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    
    if (now.toDateString() === messageDate.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = item.senderId === 'courier1'; // This should come from auth context
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        {item.type === 'text' && (
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.message}
          </Text>
        )}
        
        {item.type === 'image' && (
          <View style={styles.imageMessage}>
            <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
            {item.message !== 'Image' && (
              <Text style={[
                styles.messageText,
                isOwnMessage ? styles.ownMessageText : styles.otherMessageText
              ]}>
                {item.message}
              </Text>
            )}
          </View>
        )}
        
        {item.type === 'audio' && (
          <View style={styles.audioMessage}>
            <View style={styles.audioIcon}>
              <Mic size={16} color={isOwnMessage ? Colors.light.background : Colors.light.text} />
            </View>
            <Text style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText
            ]}>
              Voice message
            </Text>
          </View>
        )}
        
        {item.type === 'location' && (
          <View style={styles.locationMessage}>
            <MapPin size={16} color={isOwnMessage ? Colors.light.background : Colors.light.text} />
            <Text style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText
            ]}>
              Location shared
            </Text>
          </View>
        )}
        
        {item.type === 'file' && (
          <View style={styles.fileMessage}>
            <Paperclip size={16} color={isOwnMessage ? Colors.light.background : Colors.light.text} />
            <Text style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText
            ]}>
              {item.message}
            </Text>
          </View>
        )}
        
        <Text style={[
          styles.messageTime,
          isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
        ]}>
          {formatMessageTime(item.timestamp)}
        </Text>
      </View>
    );
  };

  const renderAttachmentMenu = () => (
    <Animated.View style={[
      styles.attachmentMenu,
      {
        opacity: showAttachmentMenu ? 1 : 0,
        transform: [{
          translateY: showAttachmentMenu ? 0 : 50
        }]
      }
    ]}>
      <TouchableOpacity style={styles.attachmentOption} onPress={handleCamera}>
        <View style={styles.attachmentIconContainer}>
          <Camera size={24} color={Colors.light.primary} />
        </View>
        <Text style={styles.attachmentText}>Camera</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.attachmentOption} onPress={handleImagePicker}>
        <View style={styles.attachmentIconContainer}>
          <ImageIcon size={24} color={Colors.light.primary} />
        </View>
        <Text style={styles.attachmentText}>Gallery</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.attachmentOption} onPress={handleSendLocation}>
        <View style={styles.attachmentIconContainer}>
          <MapPin size={24} color={Colors.light.primary} />
        </View>
        <Text style={styles.attachmentText}>Location</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <View style={styles.userInfo}>
              {userAvatar && (
                <Image source={{ uri: userAvatar }} style={styles.headerAvatar} />
              )}
              <View style={styles.userDetails}>
                <Text style={styles.headerTitle}>{userName}</Text>
                {deliveryId && (
                  <Text style={styles.headerSubtitle}>
                    Delivery #{deliveryId.slice(-6).toUpperCase()}
                  </Text>
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton} onPress={handlePhoneCall}>
              <Phone size={20} color={Colors.light.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton}>
              <MoreVertical size={20} color={Colors.light.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages List */}
        <KeyboardAvoidingView 
          style={styles.messagesContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading messages...</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContent}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              showsVerticalScrollIndicator={false}
              inverted={false}
            />
          )}

          {/* Attachment Menu */}
          {showAttachmentMenu && renderAttachmentMenu()}

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <TouchableOpacity 
                style={styles.attachButton}
                onPress={() => setShowAttachmentMenu(!showAttachmentMenu)}
              >
                {showAttachmentMenu ? (
                  <X size={24} color={Colors.light.primary} />
                ) : (
                  <Plus size={24} color={Colors.light.primary} />
                )}
              </TouchableOpacity>
              
              <TextInput
                style={styles.textInput}
                placeholder="Type a message..."
                placeholderTextColor={Colors.light.placeholder}
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={1000}
                onFocus={() => setShowAttachmentMenu(false)}
              />
              
              {messageText.trim() ? (
                <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                  <Send size={20} color={Colors.light.background} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[
                    styles.sendButton, 
                    isRecording && styles.recordingButton
                  ]}
                  onPress={handleVoicePress}
                  onLongPress={startRecording}
                >
                  <Mic size={20} color={Colors.light.background} />
                </TouchableOpacity>
              )}
            </View>
            
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>Recording... Release to send</Text>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    ...SHADOWS.light,
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
  },
  headerInfo: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  userDetails: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.lg,
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerActionButton: {
    padding: SPACING.sm,
    backgroundColor: Colors.light.background,
    borderRadius: BORDER_RADIUS.sm,
  },
  messagesContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: Colors.light.placeholder,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexGrow: 1,
  },
  messageContainer: {
    marginVertical: SPACING.xs,
    maxWidth: '80%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.light.primary,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.card,
  },
  messageText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    lineHeight: 20,
  },
  ownMessageText: {
    color: Colors.light.background,
  },
  otherMessageText: {
    color: Colors.light.text,
  },
  messageTime: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },
  ownMessageTime: {
    color: Colors.light.background,
    opacity: 0.8,
    textAlign: 'right',
  },
  otherMessageTime: {
    color: Colors.light.placeholder,
  },
  imageMessage: {
    gap: SPACING.xs,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: BORDER_RADIUS.sm,
  },
  audioMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  audioIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  fileMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  attachmentMenu: {
    flexDirection: 'row',
    backgroundColor: Colors.light.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    justifyContent: 'space-around',
    ...SHADOWS.light,
  },
  attachmentOption: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  attachmentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.light.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  attachmentText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.primary,
  },
  inputContainer: {
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingBottom: Platform.OS === 'ios' ? SPACING.sm : SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },
  attachButton: {
    padding: SPACING.sm,
    backgroundColor: Colors.light.background,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    maxHeight: 100,
    backgroundColor: Colors.light.background,
  },
  sendButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  recordingButton: {
    backgroundColor: Colors.light.error,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.error,
    marginRight: SPACING.sm,
  },
  recordingText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.error,
  },
});