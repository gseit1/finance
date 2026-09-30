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
import { useTheme } from '../theme/ThemeContext';

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
  const { theme } = useTheme();

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

  const tabs: {
    key: NavTab;
    label: string;
    icon: (active: boolean) => React.ReactNode;
  }[] = [
    {
      key: 'home',
      label: 'Αρχική',
      icon: (active) => (
        <NavbarHomeIcon color={active ? '#FFFFFF' : theme.navInactiveIcon} size={21} />
      ),
    },
    {
      key: 'transactions',
      label: 'Συναλλαγές',
      icon: (active) => (
        <NavbarReceiptIcon color={active ? '#FFFFFF' : theme.navInactiveIcon} size={21} />
      ),
    },
    {
      key: 'accounts',
      label: 'Λογαριασμοί',
      icon: (active) => (
        <NavbarCardIcon color={active ? '#FFFFFF' : theme.navInactiveIcon} size={21} />
      ),
    },
    {
      key: 'goals',
      label: 'Στόχοι',
      icon: (active) => (
        <NavbarGoalsIcon color={active ? '#FFFFFF' : theme.navInactiveIcon} size={20} />
      ),
    },
    {
      key: 'analytics',
      label: 'Αναλύσεις',
      icon: (active) => (
        <NavbarAnalyticsIcon color={active ? '#FFFFFF' : theme.navInactiveIcon} size={20} />
      ),
    },
  ];

  return (
    <View style={styles.dockWrapper} pointerEvents="box-none">
      <View style={[styles.dockContainer, { backgroundColor: theme.navBg, borderColor: theme.navBorder }]}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;

          if (isActive) {
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.activePill, { backgroundColor: theme.navActivePill, borderColor: theme.navActivePillBorder }]}
                onPress={() => handleSelectTab(tab.key)}
                activeOpacity={0.88}
              >
                {tab.icon(true)}
                <Text style={[styles.activeLabel, { color: theme.navActiveText }]}>{tab.label}</Text>
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
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: '#E11D74',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 9,
    gap: 8,
    borderWidth: 1,
  },
  activeLabel: {
    fontFamily: fonts.bodyMedium,
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
