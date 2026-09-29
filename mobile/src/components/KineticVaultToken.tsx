import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Image,
} from 'react-native';

const euroCoinImg = require('../assets/euro-coin.png');

export const KineticVaultToken: React.FC = () => {
  // 1. Soft anti-gravity floating bounce
  const floatAnim = useRef(new Animated.Value(0)).current;

  // 2. Subtle rotation / tilt sway
  const swayAnim = useRef(new Animated.Value(0)).current;

  // 3. Specular light gleam across metallic face
  const gleamAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Soft harmonic vertical bounce: 2.2s up, 2.2s down
    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Subtle gentle rotation sway: 3s period
    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swayAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Specular gleam across the coin face every 4.5s
    const gleamLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(gleamAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(3300),
        Animated.timing(gleamAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    bounceLoop.start();
    swayLoop.start();
    gleamLoop.start();

    return () => {
      bounceLoop.stop();
      swayLoop.stop();
      gleamLoop.stop();
    };
  }, [floatAnim, swayAnim, gleamAnim]);

  // Soft Bounce Vertical Displacement
  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, -11],
  });

  // Subtle 3D Scale Breath
  const coinScale = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.985, 1.025],
  });

  // Gentle Rotation Sway (-5deg to +5deg)
  const rotateZ = swayAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg'],
  });

  // Dynamic Contact Ground Shadow
  const groundShadowScaleX = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.2],
  });

  const groundShadowScaleY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.15, 0.85],
  });

  const groundShadowOpacity = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.28, 0.09],
  });

  // Dynamic Body Drop Shadow behind the coin
  const bodyShadowTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 15],
  });

  const bodyShadowOpacity = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.30, 0.15],
  });

  const bodyShadowScale = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 0.90],
  });

  // Specular gleam translation
  const gleamTranslateX = gleamAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 120],
  });

  return (
    <View style={styles.vaultStage}>
      <View style={styles.coinStageWrapper}>
        {/* Dynamic Ground Contact Shadow (Expands & softens as coin rises) */}
        <Animated.View
          style={[
            styles.groundShadow,
            {
              opacity: groundShadowOpacity,
              transform: [
                { scaleX: groundShadowScaleX },
                { scaleY: groundShadowScaleY },
              ],
            },
          ]}
        />

        {/* Floating 3D Euro Coin with Bounce & Rotation */}
        <Animated.View
          style={[
            styles.coinMotionGroup,
            {
              transform: [
                { translateY },
                { rotateZ },
                { scale: coinScale },
              ],
            },
          ]}
        >
          {/* Deep Ambient Body Drop Shadow */}
          <Animated.View
            style={[
              styles.coinBodyShadow,
              {
                opacity: bodyShadowOpacity,
                transform: [
                  { translateY: bodyShadowTranslateY },
                  { scale: bodyShadowScale },
                ],
              },
            ]}
          />

          {/* Masked Coin Asset with Specular Light Glint */}
          <View style={styles.coinClipWrapper}>
            <Image
              source={euroCoinImg}
              style={styles.coinImage}
              resizeMode="contain"
            />

            {/* Specular Light Sweep */}
            <Animated.View
              style={[
                styles.specularShimmer,
                { transform: [{ translateX: gleamTranslateX }, { rotate: '25deg' }] },
              ]}
              pointerEvents="none"
            />
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  vaultStage: {
    width: 155,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  coinStageWrapper: {
    width: 130,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  groundShadow: {
    position: 'absolute',
    bottom: 12,
    width: 82,
    height: 14,
    borderRadius: 41,
    backgroundColor: '#000000',
  },
  coinMotionGroup: {
    width: 100,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  coinBodyShadow: {
    position: 'absolute',
    width: 90,
    height: 94,
    borderRadius: 47,
    backgroundColor: '#000000',
    top: 4,
  },
  coinClipWrapper: {
    width: 100,
    height: 104,
    borderRadius: 50,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  coinImage: {
    width: 100,
    height: 104,
  },
  specularShimmer: {
    position: 'absolute',
    top: -25,
    bottom: -25,
    width: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
  },
});
