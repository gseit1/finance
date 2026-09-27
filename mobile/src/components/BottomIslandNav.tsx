import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Vibration,
  LayoutChangeEvent,
} from 'react-native';

export type NavTab = 'home' | 'expenses' | 'accounts' | 'goals';

interface BottomIslandNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onQuickLog?: () => void;
}

const MONO_FONT = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

// ==========================================
// CUSTOM 18px HAIRLINE VECTOR ICONS (stroke 1.75)
// ==========================================

// Slot 1 (Overview): Minimalist geometric terminal vault glyph (⌂)
const TerminalVaultGlyph: React.FC<{ color: string; size?: number }> = ({
  color,
  size = 18,
}) => {
  const s = 1.75;
  return (
    <View style={[styles.glyphCenter, { width: size, height: size }]}>
      {/* Roof peak triangle */}
      <View
        style={{
          width: 9,
          height: 6,
          borderTopWidth: s,
          borderLeftWidth: s,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          position: 'absolute',
          top: 2,
        }}
      />
      {/* Structural base */}
      <View
        style={{
          width: 11,
          height: 8,
          borderLeftWidth: s,
          borderRightWidth: s,
          borderBottomWidth: s,
          borderColor: color,
          position: 'absolute',
          bottom: 2,
        }}
      />
    </View>
  );
};

// Slot 2 (Ledger / Expenses): Angled transaction dispatch vector (↗)
const DispatchVectorGlyph: React.FC<{ color: string; size?: number }> = ({
  color,
  size = 18,
}) => {
  const s = 1.75;
  return (
    <View style={[styles.glyphCenter, { width: size, height: size }]}>
      <View style={{ width: 13, height: 13, position: 'relative' }}>
        {/* Diagonal 45-degree dispatch stroke */}
        <View
          style={{
            position: 'absolute',
            left: 0.5,
            bottom: 0.5,
            width: 12,
            height: s,
            backgroundColor: color,
            transform: [{ rotate: '-45deg' }, { translateY: -0.5 }],
          }}
        />
        {/* Arrow corner pointing north-east */}
        <View
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: 6,
            height: 6,
            borderTopWidth: s,
            borderRightWidth: s,
            borderColor: color,
          }}
        />
      </View>
    </View>
  );
};

// Slot 3 (Vault / Accounts): Hardware repository safe glyph
const HardwareVaultGlyph: React.FC<{ color: string; size?: number }> = ({
  color,
  size = 18,
}) => {
  const s = 1.75;
  return (
    <View style={[styles.glyphCenter, { width: size, height: size }]}>
      <View
        style={{
          width: 14,
          height: 12,
          borderRadius: 3,
          borderWidth: s,
          borderColor: color,
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Safe lock dial */}
        <View
          style={{
            width: 4,
            height: 4,
            borderRadius: 2,
            borderWidth: 1,
            borderColor: color,
          }}
        />
        {/* Bolt notch */}
        <View
          style={{
            position: 'absolute',
            right: 1,
            width: 3,
            height: s,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
};

// Slot 4 (Vault Targets / Goals): Precision crosshair target glyph (⨀)
const CrosshairTargetGlyph: React.FC<{ color: string; size?: number }> = ({
  color,
  size = 18,
}) => {
  const s = 1.75;
  return (
    <View style={[styles.glyphCenter, { width: size, height: size }]}>
      {/* Outer precision circle */}
      <View
        style={{
          width: 14,
          height: 14,
          borderRadius: 7,
          borderWidth: s,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Core point */}
        <View
          style={{
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

export const BottomIslandNav: React.FC<BottomIslandNavProps> = ({
  currentTab,
  onTabChange,
  onQuickLog,
}) => {
  // Kinetic spring indicator rail state
  const [tabLayouts, setTabLayouts] = useState<Record<string, { x: number; width: number }>>({});
  const slideAnimX = useRef(new Animated.Value(0)).current;
  const pillWidthAnim = useRef(new Animated.Value(0)).current;
  const hasInitialized = useRef(false);

  // Micro-haptic tactile impulse (safely guarded)
  const triggerHaptic = () => {
    try {
      if (Platform.OS === 'ios') {
        Vibration.vibrate([0, 8]);
      }
    } catch {
      // Graceful fallback
    }
  };

  const handleSelectTab = (tab: NavTab) => {
    triggerHaptic();
    onTabChange(tab);
  };

  const handleSlotLayout = (tabKey: NavTab, e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setTabLayouts((prev) => {
      const updated = { ...prev, [tabKey]: { x, width } };
      if (!hasInitialized.current && tabKey === currentTab) {
        slideAnimX.setValue(x);
        pillWidthAnim.setValue(width);
        hasInitialized.current = true;
      }
      return updated;
    });
  };

  // High-tension kinetic spring physics: stiffness: 420, damping: 32, mass: 0.8
  useEffect(() => {
    const targetLayout = tabLayouts[currentTab];
    if (targetLayout) {
      Animated.parallel([
        Animated.spring(slideAnimX, {
          toValue: targetLayout.x,
          stiffness: 420,
          damping: 32,
          mass: 0.8,
          useNativeDriver: false,
        }),
        Animated.spring(pillWidthAnim, {
          toValue: targetLayout.width,
          stiffness: 420,
          damping: 32,
          mass: 0.8,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [currentTab, tabLayouts]);

  return (
    <View style={styles.dockWrapper} pointerEvents="box-none">
      <View style={styles.dockContainer}>
        {/* Interior Specular Highlight Ring (ring-1 ring-inset ring-white/[0.05]) */}
        <View style={styles.specularRing} pointerEvents="none" />

        {/* Kinetic Sliding Indicator Rail (Animated Shared-Layout Pill) */}
        {tabLayouts[currentTab] && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.slidingIndicatorPill,
              {
                transform: [{ translateX: slideAnimX }],
                width: pillWidthAnim,
              },
            ]}
          />
        )}

        {/* ================= SLOT 1: OVERVIEW ================= */}
        <TouchableOpacity
          style={styles.tabSlot}
          onPress={() => handleSelectTab('home')}
          onLayout={(e) => handleSlotLayout('home', e)}
          activeOpacity={0.7}
        >
          <TerminalVaultGlyph color={currentTab === 'home' ? '#FFFFFF' : '#71717A'} />
          {/* Active Sub-Pixel Emerald Ping */}
          {currentTab === 'home' && <View style={styles.subPixelPing} />}
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'home' ? styles.activeTabLabel : styles.inactiveTabLabel,
            ]}
          >
            Overview
          </Text>
        </TouchableOpacity>

        {/* ================= SLOT 2: EXPENSES ================= */}
        <TouchableOpacity
          style={styles.tabSlot}
          onPress={() => handleSelectTab('expenses')}
          onLayout={(e) => handleSlotLayout('expenses', e)}
          activeOpacity={0.7}
        >
          <DispatchVectorGlyph color={currentTab === 'expenses' ? '#FFFFFF' : '#71717A'} />
          {/* Active Sub-Pixel Emerald Ping */}
          {currentTab === 'expenses' && <View style={styles.subPixelPing} />}
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'expenses' ? styles.activeTabLabel : styles.inactiveTabLabel,
            ]}
          >
            Spend
          </Text>
        </TouchableOpacity>

        {/* ================= INTEGRATED CENTER QUICK-DISPATCH TRIGGER ================= */}
        <TouchableOpacity
          style={styles.quickDispatchButton}
          onPress={() => {
            triggerHaptic();
            onQuickLog?.();
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.quickDispatchPlus}>+</Text>
        </TouchableOpacity>

        {/* ================= SLOT 3: VAULT / ACCOUNTS ================= */}
        <TouchableOpacity
          style={styles.tabSlot}
          onPress={() => handleSelectTab('accounts')}
          onLayout={(e) => handleSlotLayout('accounts', e)}
          activeOpacity={0.7}
        >
          <HardwareVaultGlyph color={currentTab === 'accounts' ? '#FFFFFF' : '#71717A'} />
          {/* Active Sub-Pixel Emerald Ping */}
          {currentTab === 'accounts' && <View style={styles.subPixelPing} />}
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'accounts' ? styles.activeTabLabel : styles.inactiveTabLabel,
            ]}
          >
            Vault
          </Text>
        </TouchableOpacity>

        {/* ================= SLOT 4: GOALS ================= */}
        <TouchableOpacity
          style={styles.tabSlot}
          onPress={() => handleSelectTab('goals')}
          onLayout={(e) => handleSlotLayout('goals', e)}
          activeOpacity={0.7}
        >
          <CrosshairTargetGlyph color={currentTab === 'goals' ? '#FFFFFF' : '#71717A'} />
          {/* Active Sub-Pixel Emerald Ping */}
          {currentTab === 'goals' && <View style={styles.subPixelPing} />}
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'goals' ? styles.activeTabLabel : styles.inactiveTabLabel,
            ]}
          >
            Goals
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dockWrapper: {
    position: 'absolute',
    bottom: 20, // bottom-5
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 50,
  },
  dockContainer: {
    height: 64, // h-16
    width: '100%',
    maxWidth: 384, // max-w-sm
    borderRadius: 32, // rounded-full
    backgroundColor: '#0C0D0E', // Solid opaque pitch-black
    borderWidth: 1,
    borderColor: '#27272A', // Crisp solid hairline border
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8, // px-2
    paddingVertical: 6, // py-1.5
    position: 'relative',
    // Layered optical ambient occlusion
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.75,
    shadowRadius: 32,
    elevation: 24,
  },
  specularRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 31,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // ring-1 ring-inset ring-white/[0.05]
  },
  slidingIndicatorPill: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    borderRadius: 26, // rounded-full
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // bg-white/[0.08]
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)', // border-white/[0.12]
    zIndex: 1,
  },
  tabSlot: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
    paddingVertical: 4,
  },
  glyphCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  subPixelPing: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#34D399',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 2,
    marginBottom: -1,
  },
  tabLabel: {
    fontFamily: MONO_FONT,
    fontSize: 9.5, // text-[10px]
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  activeTabLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inactiveTabLabel: {
    color: '#71717A', // text-zinc-500
    fontWeight: '500',
  },
  quickDispatchButton: {
    width: 44, // h-11 w-11
    height: 44,
    borderRadius: 22, // rounded-full
    backgroundColor: '#10B981', // bg-emerald-500
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    marginHorizontal: 4,
    shadowColor: '#052e16',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
  },
  quickDispatchPlus: {
    fontSize: 22,
    fontWeight: '900',
    color: '#080808',
    lineHeight: 24,
    marginTop: -1,
  },
});
