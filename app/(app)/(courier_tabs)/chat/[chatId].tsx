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
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, Send, Plus, Camera, Mic, Phone, MoreVertical,
  Image as ImageIcon, MapPin 
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';
import { useChat } from '@/contexts/ChatContext';

export default function ChatScreen() {
  const { chatId, clientName, deliveryId } = useLocalSearchParams();
  const [messageText, setMessageText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  const { 
    messages, 
    sendTextMessage, 
    sendImageMessage, 
    sendLocationMessage,
    loadMessages,
    markChatAsRead 
  } = useChat();

  useEffect(() => {
    if (chatId) {
      loadMessages(chatId as string);
      markChatAsRead(chatId as string);
    }
  }, [chatId]);

  const handleSendMessage = async () => {
    if (messageText.trim()) {
      await sendTextMessage(messageText.trim());
      setMessageText('');
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
      await sendImageMessage(result.assets[0].uri);
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
      await sendImageMessage(result.assets[0].uri);
    }
    setShowAttachmentMenu(false);
  };

  const handleSendLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant location permissions');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    await sendLocationMessage(location.coords.latitude, location.coords.longitude);
    setShowAttachmentMenu(false);
  };

  const renderMessage = ({ item }: { item: any }) => {
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
            <Text style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText
            ]}>
              {item.message}
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
        
        <Text style={[
          styles.messageTime,
          isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
        ]}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{clientName || 'Client'}</Text>
          <Text style={styles.headerSubtitle}>
            {deliveryId ? `Delivery #${(deliveryId as string).slice(-6)}` : 'Online'}
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionButton}>
            <Phone size={20} color={Colors.light.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton}>
            <MoreVertical size={20} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        showsVerticalScrollIndicator={false}
      />

      {/* Attachment Menu */}
      {showAttachmentMenu && (
        <View style={styles.attachmentMenu}>
          <TouchableOpacity style={styles.attachmentOption} onPress={handleCamera}>
            <Camera size={24} color={Colors.light.primary} />
            <Text style={styles.attachmentText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachmentOption} onPress={handleImagePicker}>
            <ImageIcon size={24} color={Colors.light.primary} />
            <Text style={styles.attachmentText}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachmentOption} onPress={handleSendLocation}>
            <MapPin size={24} color={Colors.light.primary} />
            <Text style={styles.attachmentText}>Location</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={() => setShowAttachmentMenu(!showAttachmentMenu)}
          >
            <Plus size={24} color={Colors.light.primary} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={Colors.light.placeholder}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
          />
          
          {messageText.trim() ? (
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Send size={20} color={Colors.light.background} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.sendButton, isRecording && styles.recordingButton]}
              onPress={() => setIsRecording(!isRecording)}
            >
              <Mic size={20} color={Colors.light.background} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
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
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
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
  locationMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  attachmentMenu: {
    flexDirection: 'row',
    backgroundColor: Colors.light.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    justifyContent: 'space-around',
  },
  attachmentOption: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  attachmentText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.primary,
    marginTop: SPACING.xs,
  },
  inputContainer: {
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  attachButton: {
    padding: SPACING.sm,
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
  },
  sendButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: Colors.light.error,
  },
});