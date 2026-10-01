import React from 'react';
import { View, StyleSheet } from 'react-native';

interface IconProps {
  color?: string;
  size?: number;
}

// 4-Dots Grid Menu Icon (Mockup Top Left Header)
export const GridMenuIcon: React.FC<IconProps> = ({ color = '#111827', size = 20 }) => {
  const dotSize = size * 0.38;
  const gap = size * 0.16;
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', gap }}>
        <View style={{ width: dotSize, height: dotSize, borderRadius: 2.5, backgroundColor: color }} />
        <View style={{ width: dotSize, height: dotSize, borderRadius: 2.5, backgroundColor: color }} />
      </View>
      <View style={{ height: gap }} />
      <View style={{ flexDirection: 'row', gap }}>
        <View style={{ width: dotSize, height: dotSize, borderRadius: 2.5, backgroundColor: color }} />
        <View style={{ width: dotSize, height: dotSize, borderRadius: 2.5, backgroundColor: color }} />
      </View>
    </View>
  );
};

// Search Icon (Mockup Screen 2 Top Right)
export const SearchIcon: React.FC<IconProps> = ({ color = '#111827', size = 18 }) => {
  const stroke = 1.75;
  const circleSize = size * 0.65;
  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <View
        style={{
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
          borderWidth: stroke,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: 1,
          bottom: 1,
          width: size * 0.35,
          height: stroke,
          backgroundColor: color,
          transform: [{ rotate: '45deg' }],
          borderRadius: 1,
        }}
      />
    </View>
  );
};

// Calendar Icon (Mockup Screen 3 Top Right & Card)
export const CalendarIcon: React.FC<IconProps> = ({ color = '#111827', size = 18 }) => {
  const stroke = 1.6;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Top Binding Rings */}
      <View style={{ flexDirection: 'row', width: size * 0.6, justifyContent: 'space-between', marginBottom: -2, zIndex: 2 }}>
        <View style={{ width: 2, height: 3.5, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ width: 2, height: 3.5, backgroundColor: color, borderRadius: 1 }} />
      </View>
      {/* Calendar body */}
      <View
        style={{
          width: size * 0.88,
          height: size * 0.78,
          borderWidth: stroke,
          borderColor: color,
          borderRadius: 4,
          padding: 2,
        }}
      >
        <View style={{ width: '100%', height: 2, backgroundColor: color, marginBottom: 2 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 1 }}>
          <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: color }} />
          <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: color }} />
          <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: color }} />
        </View>
      </View>
    </View>
  );
};

// Checkmark Icon (Mockup White on Purple & Green Badges)
export const CheckIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 16 }) => {
  const stroke = 2;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: size * 0.7, height: size * 0.45, position: 'relative' }}>
        <View
          style={{
            position: 'absolute',
            left: 0,
            bottom: 2,
            width: stroke,
            height: size * 0.35,
            backgroundColor: color,
            borderRadius: 1,
            transform: [{ rotate: '-45deg' }],
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: size * 0.2,
            bottom: 1.5,
            width: size * 0.55,
            height: stroke,
            backgroundColor: color,
            borderRadius: 1,
            transform: [{ rotate: '-45deg' }, { translateX: size * 0.05 }, { translateY: size * 0.05 }],
          }}
        />
      </View>
    </View>
  );
};

// Clock / Stopwatch Icon (Mockup Focus Time Badge & Time Indicators)
export const ClockIcon: React.FC<IconProps> = ({ color = '#6355E6', size = 16 }) => {
  const stroke = 1.6;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.88,
          height: size * 0.88,
          borderRadius: (size * 0.88) / 2,
          borderWidth: stroke,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            position: 'absolute',
            width: stroke,
            height: size * 0.28,
            backgroundColor: color,
            top: size * 0.14,
            borderRadius: 1,
          }}
        />
        <View
          style={{
            position: 'absolute',
            height: stroke,
            width: size * 0.22,
            backgroundColor: color,
            right: size * 0.16,
            borderRadius: 1,
          }}
        />
      </View>
    </View>
  );
};

// Folder Icon (Mockup Projects Bento Card)
export const FolderIcon: React.FC<IconProps> = ({ color = '#10B981', size = 18 }) => {
  const stroke = 1.6;
  return (
    <View style={{ width: size, height: size * 0.85, justifyContent: 'center' }}>
      {/* Folder Tab */}
      <View
        style={{
          width: size * 0.45,
          height: 3,
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
          backgroundColor: color,
          marginBottom: -1,
        }}
      />
      {/* Folder body */}
      <View
        style={{
          width: size,
          height: size * 0.65,
          borderWidth: stroke,
          borderColor: color,
          borderRadius: 3.5,
        }}
      />
    </View>
  );
};

// Home Icon (Tab 1)
export const HomeIcon: React.FC<IconProps> = ({ color = '#6355E6', size = 20 }) => {
  const stroke = 1.8;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
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
          borderBottomLeftRadius: 2,
          borderBottomRightRadius: 2,
        }}
      />
    </View>
  );
};

// Tasks List Checklist Icon (Tab 2)
export const TasksListIcon: React.FC<IconProps> = ({ color = '#9CA3AF', size = 20 }) => {
  const s = 1.75;
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', gap: 3.5 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
        <View style={{ width: 3.5, height: 3.5, borderRadius: 1.5, backgroundColor: color }} />
        <View style={{ width: size * 0.6, height: s, backgroundColor: color, borderRadius: 1 }} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
        <View style={{ width: 3.5, height: 3.5, borderRadius: 1.5, backgroundColor: color }} />
        <View style={{ width: size * 0.6, height: s, backgroundColor: color, borderRadius: 1 }} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
        <View style={{ width: 3.5, height: 3.5, borderRadius: 1.5, backgroundColor: color }} />
        <View style={{ width: size * 0.45, height: s, backgroundColor: color, borderRadius: 1 }} />
      </View>
    </View>
  );
};

// Bar Chart Analytics Icon (Tab 4)
export const BarChartIcon: React.FC<IconProps> = ({ color = '#9CA3AF', size = 20 }) => {
  const barWidth = 3;
  return (
    <View style={{ width: size, height: size, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 3 }}>
      <View style={{ width: barWidth, height: size * 0.45, backgroundColor: color, borderRadius: 1.5 }} />
      <View style={{ width: barWidth, height: size * 0.85, backgroundColor: color, borderRadius: 1.5 }} />
      <View style={{ width: barWidth, height: size * 0.6, backgroundColor: color, borderRadius: 1.5 }} />
    </View>
  );
};

// User Profile Icon (Tab 5)
export const UserIcon: React.FC<IconProps> = ({ color = '#9CA3AF', size = 20 }) => {
  const stroke = 1.75;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
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

// Target / Bullseye Goals Icon
export const GoalsIcon: React.FC<IconProps> = ({ color = '#6355E6', size = 20 }) => {
  const stroke = 1.75;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.88,
          height: size * 0.88,
          borderRadius: (size * 0.88) / 2,
          borderWidth: stroke,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: size * 0.35,
            height: size * 0.35,
            borderRadius: (size * 0.35) / 2,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
};

// Plus Icon
export const PlusIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 16 }) => {
  const stroke = 2.2;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View style={{ width: size * 0.7, height: stroke, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: stroke, height: size * 0.7, backgroundColor: color, borderRadius: 1, position: 'absolute' }} />
    </View>
  );
};

// Chevron Right Arrow Icon
export const ChevronRightIcon: React.FC<IconProps> = ({ color = '#9CA3AF', size = 16 }) => {
  const stroke = 1.8;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.42,
          height: size * 0.42,
          borderTopWidth: stroke,
          borderRightWidth: stroke,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          marginRight: 2,
        }}
      />
    </View>
  );
};

// Chevron Down Arrow Icon
export const ChevronDownIcon: React.FC<IconProps> = ({ color = '#6B7280', size = 14 }) => {
  const stroke = 1.75;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.45,
          height: size * 0.45,
          borderBottomWidth: stroke,
          borderRightWidth: stroke,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          marginBottom: 2,
        }}
      />
    </View>
  );
};

// Three Dots Horizontal Icon
export const DotsIcon: React.FC<IconProps> = ({ color = '#9CA3AF', size = 18 }) => {
  return (
    <View style={[styles.rowCenter, { width: size, height: size, gap: 2.5 }]}>
      <View style={{ width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: color }} />
      <View style={{ width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: color }} />
      <View style={{ width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: color }} />
    </View>
  );
};

// Accounts / Wallet Icon
export const AccountsIcon: React.FC<IconProps> = ({ color = '#6355E6', size = 18 }) => {
  const stroke = 1.75;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.85,
          height: size * 0.65,
          borderRadius: 4,
          borderWidth: stroke,
          borderColor: color,
          position: 'relative',
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: 2,
            left: 2,
            width: size * 0.25,
            height: size * 0.18,
            borderRadius: 1.5,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
};

// Repeat / Recurring Clock Icon
export const RepeatIcon: React.FC<IconProps> = ({ color = '#6355E6', size = 18 }) => {
  const stroke = 1.75;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.82,
          height: size * 0.82,
          borderRadius: (size * 0.82) / 2,
          borderWidth: stroke,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: stroke,
            height: size * 0.25,
            backgroundColor: color,
            position: 'absolute',
            top: size * 0.14,
          }}
        />
        <View
          style={{
            height: stroke,
            width: size * 0.2,
            backgroundColor: color,
            position: 'absolute',
            right: size * 0.18,
          }}
        />
      </View>
    </View>
  );
};

// Expenses Icon
export const ExpensesIcon: React.FC<IconProps> = ({ color = '#6355E6', size = 18 }) => {
  const stroke = 1.75;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View style={{ width: 13, height: 13, position: 'relative' }}>
        <View
          style={{
            position: 'absolute',
            left: 1,
            top: 6,
            width: 10,
            height: stroke,
            backgroundColor: color,
            transform: [{ rotate: '35deg' }],
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 5,
            height: 5,
            borderRightWidth: stroke,
            borderBottomWidth: stroke,
            borderColor: color,
          }}
        />
      </View>
    </View>
  );
};

// Discrete Pulse Dot
export const PulseDot: React.FC = () => {
  return (
    <View style={styles.pulseContainer}>
      <View style={styles.pulseOuter} />
      <View style={styles.pulseInner} />
    </View>
  );
};

// Bell Notification Icon with unread badge dot
export interface BellIconProps extends IconProps {
  hasBadge?: boolean;
  badgeColor?: string;
}

export const BellIcon: React.FC<BellIconProps> = ({
  color = '#111827',
  size = 24,
  hasBadge = false,
  badgeColor = '#EF4444',
}) => {
  const stroke = 1.8;
  const bellWidth = size * 0.72;
  const bellHeight = size * 0.76;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {/* Top Handle / Loop */}
      <View
        style={{
          width: size * 0.22,
          height: size * 0.16,
          borderWidth: stroke,
          borderColor: color,
          borderTopLeftRadius: size * 0.11,
          borderTopRightRadius: size * 0.11,
          borderBottomWidth: 0,
          marginBottom: -1,
        }}
      />
      {/* Bell Main Body */}
      <View
        style={{
          width: bellWidth,
          height: bellHeight * 0.72,
          borderTopLeftRadius: bellWidth * 0.5,
          borderTopRightRadius: bellWidth * 0.5,
          borderBottomLeftRadius: 3,
          borderBottomRightRadius: 3,
          borderWidth: stroke,
          borderColor: color,
          backgroundColor: 'transparent',
        }}
      />
      {/* Bottom Rim Flare */}
      <View
        style={{
          width: bellWidth + 4,
          height: stroke + 0.5,
          backgroundColor: color,
          borderRadius: 1,
          marginTop: -stroke,
        }}
      />
      {/* Bell Clapper */}
      <View
        style={{
          width: size * 0.22,
          height: size * 0.12,
          borderBottomLeftRadius: size * 0.11,
          borderBottomRightRadius: size * 0.11,
          backgroundColor: color,
          marginTop: 1,
        }}
      />

      {/* Unread Alert Red Dot Badge */}
      {hasBadge && (
        <View
          style={{
            position: 'absolute',
            top: 2,
            right: 2,
            width: 7,
            height: 7,
            borderRadius: 3.5,
            backgroundColor: badgeColor,
            borderWidth: 1.2,
            borderColor: '#FFFFFF',
          }}
        />
      )}
    </View>
  );
};

// --- Custom Mockup Navbar Icons matching User Reference ---

// 1. Home Pill Icon (Roof + base + door notch matching reference image)
export const NavbarHomeIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 20 }) => {
  const stroke = 1.85;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      {/* Roof peak */}
      <View
        style={{
          width: size * 0.58,
          height: size * 0.58,
          borderTopWidth: stroke,
          borderLeftWidth: stroke,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          position: 'absolute',
          top: 2,
          borderTopLeftRadius: 3,
        }}
      />
      {/* Base walls */}
      <View
        style={{
          width: size * 0.72,
          height: size * 0.48,
          borderLeftWidth: stroke,
          borderRightWidth: stroke,
          borderBottomWidth: stroke,
          borderColor: color,
          position: 'absolute',
          bottom: 2,
          borderBottomLeftRadius: 3.5,
          borderBottomRightRadius: 3.5,
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        {/* Door notch */}
        <View
          style={{
            width: stroke * 2.2,
            height: stroke,
            backgroundColor: color,
            borderRadius: 0.5,
            marginBottom: stroke * 0.7,
          }}
        />
      </View>
    </View>
  );
};

// 2. Receipt / Ledger Icon (2nd icon in reference image)
export const NavbarReceiptIcon: React.FC<IconProps> = ({ color = '#A1A1AA', size = 20 }) => {
  const stroke = 1.75;
  const w = size * 0.76;
  const h = size * 0.88;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: w,
          height: h,
          borderWidth: stroke,
          borderColor: color,
          borderRadius: 3.5,
          paddingHorizontal: 2.5,
          paddingTop: 3,
          gap: 2.2,
        }}
      >
        <View style={{ width: '80%', height: stroke * 0.85, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ width: '60%', height: stroke * 0.85, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ width: '72%', height: stroke * 0.85, backgroundColor: color, borderRadius: 1 }} />
      </View>
      {/* Scalloped teeth notches at the bottom */}
      <View
        style={{
          position: 'absolute',
          bottom: -0.5,
          flexDirection: 'row',
          width: w - 3,
          justifyContent: 'space-between',
        }}
      >
        <View style={{ width: 2, height: 2, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ width: 2, height: 2, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ width: 2, height: 2, backgroundColor: color, borderRadius: 1 }} />
      </View>
    </View>
  );
};

// 3. Accounts / Credit Card Icon (4th icon in reference image)
export const NavbarCardIcon: React.FC<IconProps> = ({ color = '#A1A1AA', size = 20 }) => {
  const stroke = 1.75;
  const w = size * 0.9;
  const h = size * 0.65;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: w,
          height: h,
          borderRadius: 3.5,
          borderWidth: stroke,
          borderColor: color,
          justifyContent: 'space-between',
          paddingVertical: 2,
        }}
      >
        {/* Top Magnetic Stripe */}
        <View style={{ width: '100%', height: stroke * 0.95, backgroundColor: color }} />
        {/* Bottom Chip / Dot */}
        <View style={{ paddingHorizontal: 2.5 }}>
          <View style={{ width: 4.5, height: 2.2, backgroundColor: color, borderRadius: 0.6 }} />
        </View>
      </View>
    </View>
  );
};

// 4. Goals / Target Icon
export const NavbarGoalsIcon: React.FC<IconProps> = ({ color = '#A1A1AA', size = 20 }) => {
  const stroke = 1.75;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.85,
          height: size * 0.85,
          borderRadius: (size * 0.85) / 2,
          borderWidth: stroke,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: size * 0.32,
            height: size * 0.32,
            borderRadius: (size * 0.32) / 2,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
};

// 5. Analytics Bars Icon
export const NavbarAnalyticsIcon: React.FC<IconProps> = ({ color = '#A1A1AA', size = 20 }) => {
  const barW = 2.4;
  return (
    <View
      style={{
        width: size,
        height: size,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 3,
        paddingBottom: 2,
      }}
    >
      <View style={{ width: barW, height: size * 0.42, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: barW, height: size * 0.84, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: barW, height: size * 0.62, backgroundColor: color, borderRadius: 1 }} />
    </View>
  );
};

// Mail Icon (Envelope)
export const MailIcon: React.FC<IconProps> = ({ color = '#71717A', size = 18 }) => {
  const width = size;
  const height = size * 0.75;
  return (
    <View style={{ width, height, borderWidth: 1.5, borderColor: color, borderRadius: 4, position: 'relative', overflow: 'hidden', alignItems: 'center' }}>
      <View style={{
        position: 'absolute',
        top: -height * 0.35,
        width: width * 0.72,
        height: width * 0.72,
        borderWidth: 1.5,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
      }} />
    </View>
  );
};

// Lock Icon (Padlock)
export const LockIcon: React.FC<IconProps> = ({ color = '#71717A', size = 18 }) => {
  const bodyWidth = size * 0.85;
  const bodyHeight = size * 0.65;
  const shackleWidth = size * 0.52;
  const shackleHeight = size * 0.45;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end', position: 'relative' }}>
      {/* Shackle */}
      <View style={{
        position: 'absolute',
        top: 1,
        width: shackleWidth,
        height: shackleHeight,
        borderTopLeftRadius: shackleWidth / 2,
        borderTopRightRadius: shackleWidth / 2,
        borderWidth: 1.6,
        borderColor: color,
        borderBottomWidth: 0,
      }} />
      {/* Body */}
      <View style={{
        width: bodyWidth,
        height: bodyHeight,
        borderRadius: 4,
        borderWidth: 1.6,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <View style={{ width: 2.2, height: 4, backgroundColor: color, borderRadius: 1 }} />
      </View>
    </View>
  );
};

// Eye Icon (Visible)
export const EyeIcon: React.FC<IconProps> = ({ color = '#71717A', size = 18 }) => {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: size * 0.85,
        height: size * 0.55,
        borderRadius: size * 0.4,
        borderWidth: 1.5,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <View style={{ width: size * 0.24, height: size * 0.24, borderRadius: size * 0.12, backgroundColor: color }} />
      </View>
    </View>
  );
};

// Eye Off Icon (Hidden)
export const EyeOffIcon: React.FC<IconProps> = ({ color = '#71717A', size = 18 }) => {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <View style={{
        width: size * 0.85,
        height: size * 0.55,
        borderRadius: size * 0.4,
        borderWidth: 1.5,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <View style={{ width: size * 0.22, height: size * 0.22, borderRadius: size * 0.11, backgroundColor: color }} />
      </View>
      <View style={{
        position: 'absolute',
        width: size * 0.95,
        height: 1.6,
        backgroundColor: color,
        transform: [{ rotate: '-45deg' }],
      }} />
    </View>
  );
};

// Checkbox Icon
export const CheckboxIcon: React.FC<{ checked: boolean; color?: string; size?: number }> = ({
  checked,
  color = '#E11D74',
  size = 18,
}) => {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: checked ? color : '#A1A1AA',
        backgroundColor: checked ? color : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {checked && (
        <View
          style={{
            width: size * 0.5,
            height: size * 0.28,
            borderLeftWidth: 1.8,
            borderBottomWidth: 1.8,
            borderColor: '#FFFFFF',
            transform: [{ rotate: '-45deg' }, { translateY: -1 }],
          }}
        />
      )}
    </View>
  );
};

// Arrow Left Icon
export const ArrowLeftIcon: React.FC<IconProps> = ({ color = '#18181B', size = 18 }) => {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.45,
          height: size * 0.45,
          borderLeftWidth: 2,
          borderTopWidth: 2,
          borderColor: color,
          transform: [{ rotate: '-45deg' }],
          marginLeft: size * 0.1,
        }}
      />
    </View>
  );
};

// Trash / Delete Icon
export const TrashIcon: React.FC<IconProps> = ({ color = '#EF4444', size = 18 }) => {
  const width = size * 0.75;
  const height = size * 0.85;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Lid */}
      <View style={{ width: width * 1.15, height: 2, backgroundColor: color, borderRadius: 1, marginBottom: 2 }} />
      <View style={{ width: width * 0.45, height: 2, backgroundColor: color, borderTopLeftRadius: 1.5, borderTopRightRadius: 1.5, position: 'absolute', top: size * 0.1 }} />
      {/* Bin Body */}
      <View
        style={{
          width,
          height: height * 0.75,
          borderWidth: 1.6,
          borderColor: color,
          borderTopWidth: 0,
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          paddingVertical: 2,
        }}
      >
        <View style={{ width: 1.4, height: '70%', backgroundColor: color, borderRadius: 0.7 }} />
        <View style={{ width: 1.4, height: '70%', backgroundColor: color, borderRadius: 0.7 }} />
      </View>
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
    width: 8,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseOuter: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
  },
  pulseInner: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
});

