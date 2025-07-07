import { StyleSheet, View, ViewProps } from 'react-native';
import Colors from '@/constants/Colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
}

export function Card({ children, style, variant = 'elevated', ...props }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        variant === 'elevated' && styles.elevatedCard,
        variant === 'outlined' && styles.outlinedCard,
        variant === 'filled' && styles.filledCard,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  elevatedCard: {
    backgroundColor: Colors.light.card,
    ...SHADOWS.light,
  },
  outlinedCard: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filledCard: {
    backgroundColor: Colors.light.disabled,
  },
});