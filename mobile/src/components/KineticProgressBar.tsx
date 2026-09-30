import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, StyleProp, ViewStyle } from 'react-native';

interface KineticProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  trackColor?: string;
  fillColor?: string;
  duration?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

export const KineticProgressBar: React.FC<KineticProgressBarProps> = ({
  progress,
  height = 4,
  trackColor = 'rgba(255, 255, 255, 0.15)',
  fillColor = '#E11D74',
  duration = 900,
  delay = 100,
  style,
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const clamped = Math.min(Math.max(progress, 0), 1);
    Animated.timing(animatedProgress, {
      toValue: clamped,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, duration, delay, animatedProgress]);

  const widthInterpolation = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.track, { height, backgroundColor: trackColor, borderRadius: height / 2 }, style]}>
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            backgroundColor: fillColor,
            borderRadius: height / 2,
            width: widthInterpolation,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
