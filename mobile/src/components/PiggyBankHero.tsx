import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';

const piggyImg = require('../assets/piggy.png');

interface PiggyBankHeroProps {
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export const PiggyBankHero: React.FC<PiggyBankHeroProps> = ({
  width = 120,
  height = 72,
  style,
}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();
    return () => floatLoop.stop();
  }, [floatAnim]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(pressScale, {
        toValue: 1.12,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(pressScale, {
        toValue: 1,
        friction: 4,
        tension: 140,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  const rotate = floatAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '-1.2deg', '0deg'],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={handlePress}
      style={[styles.container, { width, height }, style]}
    >
      <Animated.Image
        source={piggyImg}
        style={[
          styles.image,
          {
            width,
            height,
            transform: [
              { translateY },
              { rotate },
              { scale: pressScale },
            ],
          },
        ]}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
});
