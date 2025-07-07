import { Stack } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import Colors from '@/constants/Colors';

export default function AppLayout() {
  return (
    <View style={styles.container}>
      <Stack 
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.light.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(courier_tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(sme_tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});