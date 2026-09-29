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
  ChevronRightIcon,
  PlusIcon,
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
  avatarUrl?: string | null;
  tasksCount?: number;
  accountsCount?: number;
  transactionsCount?: number;
  goalsCount?: number;
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
  userName = 'Hitesh Tapaniya',
  avatarUrl,
  tasksCount = 0,
  accountsCount = 0,
  transactionsCount = 0,
  goalsCount = 0,
  onQuickAddTransaction,
  onQuickAddTask,
  onQuickAddAccount,
}) => {
  const isImageUri =
    avatarUrl &&
    (avatarUrl.startsWith('http') ||
      avatarUrl.startsWith('file:') ||
      avatarUrl.startsWith('data:') ||
      avatarUrl.startsWith('content:'));

  const navItems: {
    route: ScreenRoute;
    label: string;
    sublabel: string;
    icon: (active: boolean) => React.ReactNode;
    badge?: string | number;
  }[] = [
    {
      route: 'home',
      label: 'Home Dashboard',
      sublabel: 'Overview & Focus',
      icon: (active) => <HomeIcon size={20} color={active ? '#0A0A0A' : '#71717A'} />,
    },
    {
      route: 'tasks',
      label: 'Tasks & Focus',
      sublabel: 'Action items & priorities',
      badge: tasksCount > 0 ? tasksCount : undefined,
      icon: (active) => <TasksListIcon size={20} color={active ? '#0A0A0A' : '#71717A'} />,
    },
    {
      route: 'calendar',
      label: 'Calendar & Agenda',
      sublabel: 'Daily events & deadlines',
      icon: (active) => <CalendarIcon size={20} color={active ? '#0A0A0A' : '#71717A'} />,
    },
    {
      route: 'accounts',
      label: 'Accounts & Vault',
      sublabel: 'Banks, wallets & balances',
      badge: accountsCount > 0 ? accountsCount : undefined,
      icon: (active) => <AccountsIcon size={20} color={active ? '#0A0A0A' : '#71717A'} />,
    },
    {
      route: 'transactions',
      label: 'Transactions Ledger',
      sublabel: 'Inflows, outflows & history',
      badge: transactionsCount > 0 ? transactionsCount : undefined,
      icon: (active) => <ExpensesIcon size={20} color={active ? '#0A0A0A' : '#71717A'} />,
    },
    {
      route: 'analytics',
      label: 'Analytics & Insights',
      sublabel: 'Cashflow, trends & breakdown',
      icon: (active) => <BarChartIcon size={20} color={active ? '#0A0A0A' : '#71717A'} />,
    },
    {
      route: 'goals',
      label: 'Financial Goals',
      sublabel: 'Savings targets & deposits',
      badge: goalsCount > 0 ? goalsCount : undefined,
      icon: (active) => <GoalsIcon size={20} color={active ? '#0A0A0A' : '#71717A'} />,
    },
    {
      route: 'profile',
      label: 'Profile & Settings',
      sublabel: 'Preferences & account',
      icon: (active) => <UserIcon size={20} color={active ? '#0A0A0A' : '#71717A'} />,
    },
  ];

  const handleSelect = (route: ScreenRoute) => {
    onClose();
    setTimeout(() => {
      onNavigate(route);
    }, 150);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        {/* Backdrop (tap to close) */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        {/* Drawer Content on Left */}
        <View style={styles.drawerCard}>
          {/* Header Branding */}
          <View style={styles.drawerHeader}>
            <View style={styles.brandingGroup}>
              <View style={styles.logoPill}>
                <Text style={styles.logoText}>⚡</Text>
              </View>
              <View>
                <Text style={styles.brandTitle}>Finance Flow</Text>
                <Text style={styles.brandSubtitle}>Personal Ledger</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* User Profile Card */}
          <TouchableOpacity
            style={styles.profileBadgeCard}
            onPress={() => handleSelect('profile')}
            activeOpacity={0.8}
          >
            {isImageUri ? (
              <Image source={{ uri: avatarUrl! }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>
                  {(userName || 'U')[0].toUpperCase()}
                </Text>
              </View>
            )}

            <View style={styles.profileDetails}>
              <Text style={styles.profileName} numberOfLines={1}>
                {userName}
              </Text>
              <View style={styles.onlineBadgeRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Connected</Text>
              </View>
            </View>

            <ChevronRightIcon size={16} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Main Navigation Links */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.linksContainer}
          >
            <Text style={styles.sectionHeader}>NAVIGATION</Text>

            {navItems.map((item) => {
              const isActive = currentRoute === item.route;
              return (
                <TouchableOpacity
                  key={item.route}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  onPress={() => handleSelect(item.route)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.navIconBox, isActive && styles.navIconBoxActive]}>
                    {item.icon(isActive)}
                  </View>

                  <View style={styles.navLabelGroup}>
                    <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                      {item.label}
                    </Text>
                    <Text style={styles.navSublabel}>{item.sublabel}</Text>
                  </View>

                  {item.badge !== undefined && (
                    <View style={[styles.badgePill, isActive && styles.badgePillActive]}>
                      <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                        {item.badge}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Quick Action Shortcuts */}
            <View style={styles.shortcutsSection}>
              <Text style={styles.sectionHeader}>QUICK ACTIONS</Text>

              {onQuickAddTransaction && (
                <TouchableOpacity
                  style={styles.shortcutBtn}
                  onPress={() => {
                    onClose();
                    setTimeout(onQuickAddTransaction, 200);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.shortcutIconBox, { backgroundColor: '#F4F4F5' }]}>
                    <PlusIcon size={14} color="#0A0A0A" />
                  </View>
                  <Text style={styles.shortcutText}>Log Transaction</Text>
                </TouchableOpacity>
              )}

              {onQuickAddTask && (
                <TouchableOpacity
                  style={styles.shortcutBtn}
                  onPress={() => {
                    onClose();
                    setTimeout(onQuickAddTask, 200);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.shortcutIconBox, { backgroundColor: '#F4F4F5' }]}>
                    <PlusIcon size={14} color="#0A0A0A" />
                  </View>
                  <Text style={styles.shortcutText}>New Task</Text>
                </TouchableOpacity>
              )}

              {onQuickAddAccount && (
                <TouchableOpacity
                  style={styles.shortcutBtn}
                  onPress={() => {
                    onClose();
                    setTimeout(onQuickAddAccount, 200);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.shortcutIconBox, { backgroundColor: '#F4F4F5' }]}>
                    <PlusIcon size={14} color="#0A0A0A" />
                  </View>
                  <Text style={styles.shortcutText}>Add Wallet / Account</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          {/* Footer Info */}
          <View style={styles.drawerFooter}>
            <Text style={styles.footerVersion}>Personal Finance v2.0 • Light Edition</Text>
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
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
  },
  drawerCard: {
    width: Math.min(320, SCREEN_WIDTH * 0.82),
    height: '100%',
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingBottom: 20,
    paddingHorizontal: 18,
    borderRightWidth: 1,
    borderRightColor: '#E4E4E7',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E7',
    marginBottom: 14,
  },
  brandingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoPill: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  logoText: {
    fontSize: 20,
  },
  brandTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: '900',
    color: '#0A0A0A',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontFamily: fonts.bodyLight,
    fontSize: 11,
    fontWeight: '600',
    color: '#71717A',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#71717A',
  },
  profileBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  avatarInitial: {
    fontFamily: fonts.heading,
    fontSize: 18,
    fontWeight: '800',
    color: '#0A0A0A',
  },
  profileDetails: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontFamily: fonts.heading,
    fontSize: 14,
    fontWeight: '700',
    color: '#0A0A0A',
  },
  onlineBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  onlineText: {
    fontFamily: fonts.bodyLight,
    fontSize: 11,
    color: '#71717A',
    fontWeight: '500',
  },
  linksContainer: {
    paddingBottom: 24,
  },
  sectionHeader: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: '#F4F4F5',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  navIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  navIconBoxActive: {
    backgroundColor: '#FFFFFF',
  },
  navLabelGroup: {
    flex: 1,
  },
  navLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    fontWeight: '600',
    color: '#71717A',
  },
  navLabelActive: {
    fontFamily: fonts.heading,
    fontWeight: '800',
    color: '#0A0A0A',
  },
  navSublabel: {
    fontFamily: fonts.bodyLight,
    fontSize: 11,
    color: '#71717A',
    marginTop: 1,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#F4F4F5',
  },
  badgePillActive: {
    backgroundColor: '#0A0A0A',
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#71717A',
  },
  badgeTextActive: {
    color: '#FFFFFF',
  },
  shortcutsSection: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E4E4E7',
  },
  shortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  shortcutIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  shortcutText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    fontWeight: '600',
    color: '#0A0A0A',
  },
  drawerFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E4E4E7',
  },
  footerVersion: {
    fontFamily: fonts.bodyLight,
    fontSize: 11,
    color: '#71717A',
    textAlign: 'center',
  },
});
