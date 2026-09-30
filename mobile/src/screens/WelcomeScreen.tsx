import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';
import { KineticPressable } from '../components/KineticPressable';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const piggyImg = require('../assets/piggy.png');

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
  onSignIn,
}) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  // Gentle anti-gravity floating animation for the big piggy bank
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    floatLoop.start();
    return () => floatLoop.stop();
  }, [floatAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const rotate = floatAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '-1deg', '0deg'],
  });

  // Responsive image dimensions (large and prominent as requested)
  const piggyWidth = Math.min(SCREEN_WIDTH - 32, 370);
  const piggyHeight = Math.round(piggyWidth * 0.585); // 1.71 : 1 aspect ratio

  return (
    <View style={[styles.container, { backgroundColor: '#F8F8F6' }]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header Block (Greek only) */}
      <View style={[styles.headerBlock, { paddingTop: Math.max(insets.top + 16, 44) }]}>
        <Text style={styles.titleText}>Καλώς ήρθατε</Text>
        <Text style={styles.subtitleText}>Συνδεθείτε ή εγγραφείτε για να συνεχίσετε</Text>
      </View>

      {/* Centerpiece Hero: Large 3D Piggy Bank with kinetic floating float */}
      <View style={styles.heroCenterpiece}>
        <Animated.Image
          source={piggyImg}
          style={[
            styles.piggyHeroImage,
            {
              width: piggyWidth,
              height: piggyHeight,
              transform: [{ translateY }, { rotate }],
            },
          ]}
          resizeMode="contain"
        />
      </View>

      {/* Lower Action Deck (Greek only, no guest link) */}
      <View style={[styles.bottomDeck, { paddingBottom: Math.max(insets.bottom + 20, 36) }]}>
        {/* Primary CTA: Δημιουργία λογαριασμού */}
        <KineticPressable
          style={[styles.primaryButton, { backgroundColor: theme.brandPink }]}
          onPress={onGetStarted}
        >
          <Text style={styles.primaryButtonText}>Δημιουργία λογαριασμού</Text>
        </KineticPressable>

        {/* Secondary CTA: Έχω ήδη λογαριασμό */}
        <KineticPressable
          style={styles.secondaryButton}
          onPress={onSignIn}
        >
          <Text style={styles.secondaryButtonText}>Έχω ήδη λογαριασμό</Text>
        </KineticPressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerBlock: {
    paddingHorizontal: 24,
  },
  titleText: {
    fontFamily: fonts.heading,
    fontSize: 34,
    fontWeight: '900',
    color: '#18181B',
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  subtitleText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: '#71717A',
    letterSpacing: -0.2,
  },
  heroCenterpiece: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  piggyHeroImage: {
    alignSelf: 'center',
  },
  bottomDeck: {
    paddingHorizontal: 24,
    gap: 12,
  },
  primaryButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E11D74',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  secondaryButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E4E4E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15.5,
    fontWeight: '800',
    color: '#18181B',
    letterSpacing: -0.2,
  },
});
