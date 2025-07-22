import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { Link, router } from 'expo-router';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { Button } from '@/components/ui/Button';
import { useCallback } from 'react';

export default function WelcomeScreen() {
  const handleGetStarted = useCallback(() => {
    router.push('/(auth)/register');
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        
        <View style={styles.overlay} />
        <View style={styles.content}>
          <LottieView
            source={{ uri: 'https://lottie.host/66ff6de2-394e-4010-8064-1d884167dbf6/do1Etdp721.json' }}
            autoPlay
            loop
            style={styles.backgroundImage}
            />

          <Text style={styles.title}>Sonic Logistics</Text>
          <Text style={styles.subtitle}>
            Providing seamless logistics solutions across Africa, connecting businesses and consumers with ease.
          </Text>
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <Button 
          title="Get Started" 
          onPress={handleGetStarted}
          style={styles.button}
        />
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Sign in here</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  logoContainer: {
    flex: 3,
    position: 'relative',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(250, 246, 246, 0.5)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: SPACING.md,
  },
  title: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.xxxl,
    color: Colors.light.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.xs,
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  button: {
    marginBottom: SPACING.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.text,
  },
  loginLink: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.primary,
    marginLeft: SPACING.xs,
  },
});