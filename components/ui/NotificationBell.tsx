import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Bell } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SHADOWS } from '@/constants/Theme';

interface NotificationBellProps {
  hasUnread: boolean;
  onPress: () => void;
}

export function NotificationBell({ hasUnread, onPress }: NotificationBellProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hasUnread) {
      // Start pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      // Start glow animation
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );

      pulseAnimation.start();
      glowAnimation.start();

      return () => {
        pulseAnimation.stop();
        glowAnimation.stop();
      };
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [hasUnread]);

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Animated.View
        style={[
          styles.bellContainer,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Bell size={24} color={Colors.light.text} />
        {hasUnread && (
          <Animated.View
            style={[
              styles.notificationDot,
              {
                opacity: glowAnim,
              },
            ]}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  bellContainer: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    ...SHADOWS.light,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.error,
    borderWidth: 2,
    borderColor: Colors.light.background,
  },
});