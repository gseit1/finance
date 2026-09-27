import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Image } from 'react-native';

export const TitaniumCardVisual: React.FC = () => {
  // Animations: Rotation, float bob, breathing scale, and subtle fade-in
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Subtle smooth fade-in on mount
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // 2. Continuous slow rotation of concentric rings
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 22000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 3. Subtle floating bob of the emblem
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 4. Gentle breathing scale
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.02,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.98,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [rotateAnim, floatAnim, scaleAnim, fadeAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const reverseSpin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Dynamic Background Ring Stack */}
      <View style={styles.ringsCenter}>
        {/* Outer Ring: 310px */}
        <Animated.View
          style={[
            styles.ring,
            { width: 310, height: 310, borderRadius: 155, transform: [{ rotate: spin }] },
          ]}
        >
          <View style={styles.ringMarkerTop} />
          <View style={styles.ringMarkerBottom} />
        </Animated.View>

        {/* Middle Ring: 250px dashed */}
        <Animated.View
          style={[
            styles.ring,
            {
              width: 250,
              height: 250,
              borderRadius: 125,
              borderStyle: 'dashed',
              transform: [{ rotate: reverseSpin }],
            },
          ]}
        />

        {/* Inner Ring: 195px */}
        <Animated.View
          style={[
            styles.ring,
            { width: 195, height: 195, borderRadius: 97.5, transform: [{ rotate: spin }] },
          ]}
        >
          <View style={styles.ringMarkerLeft} />
          <View style={styles.ringMarkerRight} />
        </Animated.View>

        {/* Ambient Core Radial Glows */}
        <View style={styles.coreGlowPink} />
        <View style={styles.coreGlowEmerald} />
      </View>

      {/* Floating Animated Emblem with finance-logo.png */}
      <Animated.View
        style={[
          styles.emblemWrapper,
          {
            transform: [
              { translateY: floatAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <View style={styles.logoFrame}>
          <Image
            source={require('../assets/finance-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
};

// Also export as AnimatedLogoVisual for semantic clarity
export const AnimatedLogoVisual = TitaniumCardVisual;

const styles = StyleSheet.create({
  container: {
    height: 320,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  ringsCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringMarkerTop: {
    position: 'absolute',
    top: -2,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FAFAFA',
  },
  ringMarkerBottom: {
    position: 'absolute',
    bottom: -2,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  ringMarkerLeft: {
    position: 'absolute',
    left: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EC4899',
  },
  ringMarkerRight: {
    position: 'absolute',
    right: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10B981',
  },
  coreGlowPink: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
  },
  coreGlowEmerald: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
  },
  emblemWrapper: {
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 16,
  },
  logoFrame: {
    width: 190,
    height: 190,
    borderRadius: 42,
    backgroundColor: '#000000',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 182,
    height: 182,
    borderRadius: 38,
  },
});
