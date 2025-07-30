import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { X, Clock, Package, CircleAlert as AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';
import { useNotifications } from '@/contexts/NotificationContext';

interface NotificationPanelProps {
  visible: boolean;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function NotificationPanel({ visible, onClose }: NotificationPanelProps) {
  const slideAnim = useRef(new Animated.Value(-screenHeight * 0.6)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const { notifications, markAsRead, loading } = useNotifications();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -screenHeight * 0.6,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleNotificationPress = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleDismiss = async (notificationId: string, event: any) => {
    event.stopPropagation();
    await markAsRead(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'delivery':
        return Package;
      case 'update':
        return AlertCircle;
      case 'system':
        return Clock;
      default:
        return AlertCircle;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'delivery':
        return Colors.light.primary;
      case 'update':
        return Colors.light.warning;
      case 'system':
        return Colors.light.success;
      default:
        return Colors.light.placeholder;
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayAnim,
            },
          ]}
        />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.panel,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading notifications...</Text>
            </View>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);

              return (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    notification.read && styles.notificationItemRead,
                  ]}
                  onPress={() => handleNotificationPress(notification.id)}
                >
                  <View style={[styles.notificationIcon, { backgroundColor: `${iconColor}20` }]}>
                    <IconComponent size={20} color={iconColor} />
                  </View>

                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <TouchableOpacity
                        onPress={(e) => handleDismiss(notification.id, e)}
                        style={styles.dismissButton}
                      >
                        <X size={16} color={Colors.light.placeholder} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationTime}>
                      {notification.createdAt.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>

                  {!notification.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Package size={48} color={Colors.light.placeholder} />
              <Text style={styles.emptyStateTitle}>No Notifications</Text>
              <Text style={styles.emptyStateText}>You're all caught up!</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.6,
    backgroundColor: Colors.light.background,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
    ...SHADOWS.heavy,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.xl,
    color: Colors.light.text,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
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
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    position: 'relative',
  },
  notificationItemRead: {
    opacity: 0.7,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  notificationTitle: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  dismissButton: {
    padding: SPACING.xs,
  },
  notificationMessage: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
    lineHeight: 18,
    marginBottom: SPACING.xs,
  },
  notificationTime: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: Colors.light.placeholder,
  },
  unreadDot: {
    position: 'absolute',
    top: SPACING.md,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
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
  },
});