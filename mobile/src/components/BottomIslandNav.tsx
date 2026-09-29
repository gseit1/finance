import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Vibration,
} from 'react-native';
import {
  NavbarHomeIcon,
  NavbarReceiptIcon,
  NavbarCardIcon,
  NavbarGoalsIcon,
  NavbarAnalyticsIcon,
} from './VectorIcons';
import { fonts } from '../theme/typography';

export type NavTab =
  | 'home'
  | 'tasks'
  | 'calendar'
  | 'accounts'
  | 'transactions'
  | 'analytics'
  | 'goals'
  | 'profile';

interface BottomIslandNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onQuickLog?: () => void;
}

export const BottomIslandNav: React.FC<BottomIslandNavProps> = ({
  currentTab,
  onTabChange,
}) => {
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

  // The 5 requested tabs matching user's reference mockup:
  // home, transactions, accounts, goals, analytics
  const tabs: {
    key: NavTab;
    label: string;
    icon: (active: boolean) => React.ReactNode;
  }[] = [
    {
      key: 'home',
      label: 'Home',
      icon: (active) => (
        <NavbarHomeIcon color={active ? '#FFFFFF' : '#71717A'} size={21} />
      ),
    },
    {
      key: 'transactions',
      label: 'Transactions',
      icon: (active) => (
        <NavbarReceiptIcon color={active ? '#FFFFFF' : '#71717A'} size={21} />
      ),
    },
    {
      key: 'accounts',
      label: 'Accounts',
      icon: (active) => (
        <NavbarCardIcon color={active ? '#FFFFFF' : '#71717A'} size={21} />
      ),
    },
    {
      key: 'goals',
      label: 'Goals',
      icon: (active) => (
        <NavbarGoalsIcon color={active ? '#FFFFFF' : '#71717A'} size={20} />
      ),
    },
    {
      key: 'analytics',
      label: 'Analytics',
      icon: (active) => (
        <NavbarAnalyticsIcon color={active ? '#FFFFFF' : '#71717A'} size={20} />
      ),
    },
  ];

  return (
    <View style={styles.dockWrapper} pointerEvents="box-none">
      <View style={styles.dockContainer}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;

          if (isActive) {
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.activePill}
                onPress={() => handleSelectTab(tab.key)}
                activeOpacity={0.88}
              >
                {tab.icon(true)}
                <Text style={styles.activeLabel}>{tab.label}</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.inactiveSlot}
              onPress={() => handleSelectTab(tab.key)}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
            >
              {tab.icon(false)}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dockWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 50,
  },
  dockContainer: {
    height: 62,
    width: '100%',
    maxWidth: 420,
    borderRadius: 31,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#27272A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 9,
    gap: 8,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  activeLabel: {
    fontFamily: fonts.bodyMedium,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  inactiveSlot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
