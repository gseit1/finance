import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import {
  HomeIcon,
  TasksListIcon,
  CalendarIcon,
  AccountsIcon,
  ExpensesIcon,
  BarChartIcon,
  GoalsIcon,
  UserIcon,
} from './VectorIcons';
import { fonts } from '../theme/typography';

export type ScreenRoute =
  | 'home'
  | 'tasks'
  | 'calendar'
  | 'accounts'
  | 'transactions'
  | 'analytics'
  | 'goals'
  | 'profile';

interface SideDrawerNavProps {
  visible: boolean;
  onClose: () => void;
  currentRoute: ScreenRoute;
  onNavigate: (route: ScreenRoute) => void;
  userName?: string;
  userEmail?: string;
  avatarUrl?: string | null;
  tasksCount?: number;
  accountsCount?: number;
  transactionsCount?: number;
  goalsCount?: number;
  onSignOut?: () => void;
  onQuickAddTransaction?: () => void;
  onQuickAddTask?: () => void;
  onQuickAddAccount?: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export const SideDrawerNav: React.FC<SideDrawerNavProps> = ({
  visible,
  onClose,
  currentRoute,
  onNavigate,
  userName = 'Bardia Adibi',
  userEmail,
  avatarUrl,
  tasksCount = 0,
  accountsCount = 0,
  transactionsCount = 0,
  goalsCount = 0,
  onSignOut,
}) => {
  const isImageUri =
    avatarUrl &&
    (avatarUrl.startsWith('http') ||
      avatarUrl.startsWith('file:') ||
      avatarUrl.startsWith('data:') ||
      avatarUrl.startsWith('content:'));

  const displayEmail =
    userEmail || `${(userName || 'user').toLowerCase().replace(/\s+/g, '')}@gmail.com`;

  const navItems: {
    route: ScreenRoute;
    label: string;
    icon: (active: boolean) => React.ReactNode;
    badge?: string | number;
    isSpecialBadge?: boolean;
  }[] = [
    {
      route: 'home',
      label: 'Home',
      icon: (active) => <HomeIcon size={22} color={active ? '#0A0A0A' : '#27272A'} />,
    },
    {
      route: 'tasks',
      label: 'Tasks & Focus',
      icon: (active) => <TasksListIcon size={22} color={active ? '#0A0A0A' : '#27272A'} />,
      badge: tasksCount > 0 ? tasksCount : undefined,
    },
    {
      route: 'calendar',
      label: 'Calendar & Agenda',
      icon: (active) => <CalendarIcon size={22} color={active ? '#0A0A0A' : '#27272A'} />,
    },
    {
      route: 'accounts',
      label: 'Accounts & Vault',
      icon: (active) => <AccountsIcon size={22} color={active ? '#0A0A0A' : '#27272A'} />,
      badge: accountsCount > 0 ? accountsCount : undefined,
    },
    {
      route: 'transactions',
      label: 'Transactions',
      icon: (active) => <ExpensesIcon size={22} color={active ? '#0A0A0A' : '#27272A'} />,
    },
    {
      route: 'goals',
      label: 'Financial Goals',
      icon: (active) => <GoalsIcon size={22} color={active ? '#0A0A0A' : '#27272A'} />,
      badge: '$10',
      isSpecialBadge: true,
    },
    {
      route: 'analytics',
      label: 'Analytics',
      icon: (active) => <BarChartIcon size={22} color={active ? '#0A0A0A' : '#27272A'} />,
    },
    {
      route: 'profile',
      label: 'Setting',
      icon: (active) => <UserIcon size={22} color={active ? '#0A0A0A' : '#27272A'} />,
    },
  ];

  const handleSelect = (route: ScreenRoute) => {
    onClose();
    setTimeout(() => {
      onNavigate(route);
    }, 150);
  };

  const handleSignOut = () => {
    onClose();
    if (onSignOut) {
      setTimeout(onSignOut, 200);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        {/* Dimmed backdrop - tap to close */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        {/* Floating White Card matching Mockup */}
        <View style={styles.drawerCard}>
          {/* Top Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              {isImageUri ? (
                <Image source={{ uri: avatarUrl! }} style={styles.avatarImg} />
              ) : (
                <Image
                  source={require('../assets/hero_avatar.png')}
                  style={styles.avatarImg}
                  resizeMode="cover"
                />
              )}
            </View>

            <Text style={styles.profileName} numberOfLines={1}>
              {userName}
            </Text>
            <Text style={styles.profileEmail} numberOfLines={1}>
              {displayEmail}
            </Text>
          </View>

          {/* Hairline Divider */}
          <View style={styles.divider} />

          {/* Navigation Links matching Mockup */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.linksScrollContent}
          >
            {navItems.map((item) => {
              const isActive = currentRoute === item.route;
              return (
                <TouchableOpacity
                  key={item.route}
                  style={styles.navRow}
                  onPress={() => handleSelect(item.route)}
                  activeOpacity={0.65}
                >
                  <View style={styles.navIconBox}>
                    {item.icon(isActive)}
                  </View>

                  <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                    {item.label}
                  </Text>

                  {item.badge !== undefined && (
                    <View
                      style={[
                        styles.badgePill,
                        item.isSpecialBadge ? styles.specialBadgePill : styles.regularBadgePill,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          item.isSpecialBadge ? styles.specialBadgeText : styles.regularBadgeText,
                        ]}
                      >
                        {item.badge}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Bottom "Sign out" Pill Button matching Mockup */}
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={styles.signOutBtn}
              onPress={handleSignOut}
              activeOpacity={0.8}
            >
              <Text style={styles.signOutText}>Sign out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  drawerCard: {
    width: Math.min(320, SCREEN_WIDTH * 0.82),
    alignSelf: 'stretch',
    marginVertical: 16,
    marginLeft: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    overflow: 'hidden',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  profileHeader: {
    paddingTop: Platform.OS === 'ios' ? 44 : 32,
    paddingHorizontal: 24,
  },
  avatarWrapper: {
    width: 76,
    height: 76,
    borderRadius: 38,
    overflow: 'hidden',
    backgroundColor: '#0A0A0A',
    marginBottom: 16,
  },
  avatarImg: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  profileName: {
    fontFamily: fonts.heading,
    fontSize: 24,
    fontWeight: '900',
    color: '#0A0A0A',
    letterSpacing: -0.4,
  },
  profileEmail: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F2',
    marginHorizontal: 24,
    marginTop: 18,
    marginBottom: 8,
  },
  linksScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  navIconBox: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  navLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0A0A',
    flex: 1,
  },
  navLabelActive: {
    fontWeight: '800',
  },
  badgePill: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regularBadgePill: {
    backgroundColor: '#F4F4F5',
  },
  specialBadgePill: {
    backgroundColor: '#FACC15',
    paddingHorizontal: 9,
    paddingVertical: 2.5,
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    fontWeight: '700',
  },
  regularBadgeText: {
    color: '#71717A',
  },
  specialBadgeText: {
    color: '#0A0A0A',
    fontWeight: '800',
  },
  footerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
  },
  signOutBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    fontWeight: '600',
    color: '#0A0A0A',
  },
});
