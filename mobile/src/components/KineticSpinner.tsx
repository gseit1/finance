import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { fonts } from '../theme/typography';

export type KineticSpinnerSize = 'small' | 'medium' | 'large' | number;

interface KineticSpinnerProps {
  size?: KineticSpinnerSize;
  color?: string;
  secondaryColor?: string;
  label?: string;
  labelColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const KineticSpinner: React.FC<KineticSpinnerProps> = ({
  size = 'medium',
  color = '#E11D74',
  secondaryColor,
  label,
  labelColor = 'rgba(255, 255, 255, 0.75)',
  style,
}) => {
  const outerRotate = useRef(new Animated.Value(0)).current;
  const innerRotate = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(0)).current;

  // Resolve numerical dimensions
  let outerDim = 36;
  let innerDim = 22;
  let centerDim = 6;
  let outerStroke = 3;
  let innerStroke = 2.2;

  if (typeof size === 'number') {
    outerDim = size;
    innerDim = Math.round(size * 0.62);
    centerDim = Math.max(3, Math.round(size * 0.16));
    outerStroke = Math.max(1.5, Math.round(size * 0.08));
    innerStroke = Math.max(1.2, Math.round(size * 0.06));
  } else if (size === 'small') {
    outerDim = 20;
    innerDim = 12;
    centerDim = 3.5;
    outerStroke = 2;
    innerStroke = 1.5;
  } else if (size === 'large') {
    outerDim = 64;
    innerDim = 40;
    centerDim = 10;
    outerStroke = 4;
    innerStroke = 2.8;
  }

  const resolvedSecColor = secondaryColor || (color === '#FFFFFF' ? 'rgba(255, 255, 255, 0.6)' : '#38BDF8');

  useEffect(() => {
    // 1. Clockwise outer ring
    const outerLoop = Animated.loop(
      Animated.timing(outerRotate, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 2. Counter-clockwise inner ring with harmonic frequency
    const innerLoop = Animated.loop(
      Animated.timing(innerRotate, {
        toValue: 1,
        duration: 850,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 3. Harmonic core breathing pulse
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    outerLoop.start();
    innerLoop.start();
    pulseLoop.start();

    return () => {
      outerLoop.stop();
      innerLoop.stop();
      pulseLoop.stop();
    };
  }, [outerRotate, innerRotate, pulseScale]);

  const outerSpin = outerRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const innerSpin = innerRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const coreScale = pulseScale.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 1.25],
  });

  const coreOpacity = pulseScale.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 1],
  });

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.spinnerHolder, { width: outerDim, height: outerDim }]}>
        {/* Outer Kinetic Ring */}
        <Animated.View
          style={[
            styles.ring,
            {
              width: outerDim,
              height: outerDim,
              borderRadius: outerDim / 2,
              borderWidth: outerStroke,
              borderTopColor: color,
              borderRightColor: color,
              borderBottomColor: 'transparent',
              borderLeftColor: 'transparent',
              transform: [{ rotate: outerSpin }],
            },
          ]}
        />

        {/* Inner Counter-Rotating Kinetic Ring */}
        <Animated.View
          style={[
            styles.ring,
            {
              width: innerDim,
              height: innerDim,
              borderRadius: innerDim / 2,
              borderWidth: innerStroke,
              borderTopColor: 'transparent',
              borderRightColor: resolvedSecColor,
              borderBottomColor: resolvedSecColor,
              borderLeftColor: 'transparent',
              transform: [{ rotate: innerSpin }],
            },
          ]}
        />

        {/* Pulsing Core Micro-dot */}
        <Animated.View
          style={[
            styles.coreDot,
            {
              width: centerDim,
              height: centerDim,
              borderRadius: centerDim / 2,
              backgroundColor: color,
              transform: [{ scale: coreScale }],
              opacity: coreOpacity,
            },
          ]}
        />
      </View>

      {label ? (
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  spinnerHolder: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
  },
  coreDot: {
    position: 'absolute',
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
