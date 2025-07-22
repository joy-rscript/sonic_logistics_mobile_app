// app/(app)/index.tsx
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, Text } from 'react-native';

export default function AppIndex() {
  const router = useRouter();

  //  actual state from context, async storage, etc.
  const isAuthenticated = false; 
  const userRole = 'sme'; 

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)');
    } else if (userRole === 'sme') {
      router.replace('/(app)/(sme_tabs)');
    } else if (userRole === 'courier') {
      router.replace('/(app)/(courier_tabs)');
    } else {
      // fallback
      router.replace('/(auth)');
    }
  }, []);

  return (
    <View>
      <Text>Redirecting based on role...</Text>
    </View>
  );
}
