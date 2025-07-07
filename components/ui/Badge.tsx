import { StyleSheet, Text, View, ViewProps } from 'react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';

interface BadgeProps extends ViewProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium';
}

export function Badge({
  label,
  variant = 'primary',
  size = 'small',
  style,
  ...props
}: BadgeProps) {
  const badgeStyles = [
    styles.badge,
    styles[`${variant}Badge`],
    styles[`${size}Badge`],
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
  ];

  return (
    <View style={badgeStyles} {...props}>
      <Text style={textStyles}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    alignSelf: 'flex-start',
  },
  primaryBadge: {
    backgroundColor: `${Colors.light.primary}20`,
  },
  secondaryBadge: {
    backgroundColor: `${Colors.light.secondary}20`,
  },
  successBadge: {
    backgroundColor: `${Colors.light.success}20`,
  },
  warningBadge: {
    backgroundColor: `${Colors.light.warning}20`,
  },
  errorBadge: {
    backgroundColor: `${Colors.light.error}20`,
  },
  smallBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  mediumBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
  },
  text: {
    fontFamily: FONT.medium,
  },
  primaryText: {
    color: Colors.light.primary,
  },
  secondaryText: {
    color: Colors.light.secondary,
  },
  successText: {
    color: Colors.light.success,
  },
  warningText: {
    color: Colors.light.warning,
  },
  errorText: {
    color: Colors.light.error,
  },
  smallText: {
    fontSize: FONT_SIZE.xs,
  },
  mediumText: {
    fontSize: FONT_SIZE.sm,
  },
});