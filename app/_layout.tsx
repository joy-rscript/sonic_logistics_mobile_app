import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';
import { DeliveryProvider } from '@/contexts/DeliveryContext';
import { UserProvider } from '@/contexts/UserContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ChatProvider } from '@/contexts/ChatContext';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-Bold': Inter_700Bold,
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-Bold': Poppins_700Bold,
  });

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // In a real app, you'd check AsyncStorage or your auth provider
        // For now, we'll assume user is not authenticated
        const authStatus = false; // Replace with actual auth check
        setIsAuthenticated(authStatus);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (fontsLoaded || fontError) {
      checkAuthStatus();
    }
  }, [fontsLoaded, fontError]);

  // Hide splash screen once fonts are loaded and auth is checked
  useEffect(() => {
    if ((fontsLoaded || fontError) && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isLoading]);

  // Return null to keep splash screen visible while loading
  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (isLoading) {
    return null;
  }

  return (
    <UserProvider>
      <NotificationProvider>
        <ChatProvider>
          <DeliveryProvider>
            <Stack screenOptions={{ headerShown: false }}>
              {!isAuthenticated ? (
                // Authentication screens
                <>
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                </>
              ) : (
                // Authenticated app screens
                <>
                  <Stack.Screen name="(app)" options={{ headerShown: false }} />
                </>
              )}
              <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
            </Stack>
            <StatusBar style="auto" />
          </DeliveryProvider>
        </ChatProvider>
      </NotificationProvider>
    </UserProvider>
  );
}