import React from 'react';
import { View, StyleSheet } from 'react-native';

interface IconProps {
  color?: string;
  size?: number;
}

// 20px minimal stroke Home Icon
export const HomeIcon: React.FC<IconProps> = ({ color = '#FAFAFA', size = 20 }) => {
  const stroke = 1.75;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      {/* Roof peak triangle */}
      <View
        style={{
          width: 12,
          height: 7,
          borderTopWidth: stroke,
          borderLeftWidth: stroke,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          position: 'absolute',
          top: 3,
        }}
      />
      {/* House base */}
      <View
        style={{
          width: 12,
          height: 9,
          borderLeftWidth: stroke,
          borderRightWidth: stroke,
          borderBottomWidth: stroke,
          borderColor: color,
          position: 'absolute',
          bottom: 2,
        }}
      />
    </View>
  );
};

// 20px minimal stroke Expenses / Trending Chart Icon
export const ExpensesIcon: React.FC<IconProps> = ({ color = '#FAFAFA', size = 20 }) => {
  const stroke = 1.75;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      {/* Trend down arrow & polyline */}
      <View
        style={{
          width: 14,
          height: 14,
          position: 'relative',
        }}
      >
        {/* Slanted trend stroke */}
        <View
          style={{
            position: 'absolute',
            left: 1,
            top: 6,
            width: 11,
            height: stroke,
            backgroundColor: color,
            transform: [{ rotate: '35deg' }],
          }}
        />
        {/* Arrow corner pointing downward */}
        <View
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 6,
            height: 6,
            borderRightWidth: stroke,
            borderBottomWidth: stroke,
            borderColor: color,
          }}
        />
        {/* Origin dot */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 2,
            width: 3.5,
            height: 3.5,
            borderRadius: 2,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
};

// 20px minimal stroke Goals / Target Icon
export const GoalsIcon: React.FC<IconProps> = ({ color = '#FAFAFA', size = 20 }) => {
  const stroke = 1.75;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      {/* Outer target circle */}
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          borderWidth: stroke,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Center bullseye dot */}
        <View
          style={{
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
};

// 3-dots Quick Settings Icon
export const DotsIcon: React.FC<IconProps> = ({ color = '#FAFAFA', size = 20 }) => {
  return (
    <View style={[styles.rowCenter, { width: size, height: size, gap: 3 }]}>
      <View style={{ width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: color }} />
      <View style={{ width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: color }} />
      <View style={{ width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: color }} />
    </View>
  );
};

// Discrete 6px Green Status Pulse Dot
export const PulseDot: React.FC = () => {
  return (
    <View style={styles.pulseContainer}>
      <View style={styles.pulseOuter} />
      <View style={styles.pulseInner} />
    </View>
  );
};

// Minimalist User / Operator Icon
export const UserIcon: React.FC<IconProps> = ({ color = '#FAFAFA', size = 20 }) => {
  const stroke = 1.75;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      {/* Head */}
      <View
        style={{
          width: size * 0.42,
          height: size * 0.42,
          borderRadius: size * 0.21,
          borderWidth: stroke,
          borderColor: color,
          marginBottom: 1.5,
        }}
      />
      {/* Torso Arc */}
      <View
        style={{
          width: size * 0.78,
          height: size * 0.35,
          borderTopLeftRadius: size * 0.35,
          borderTopRightRadius: size * 0.35,
          borderWidth: stroke,
          borderColor: color,
          borderBottomWidth: 0,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseContainer: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  pulseOuter: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
  },
  pulseInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
});
