import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HomeIcon, ExpensesIcon, GoalsIcon } from './VectorIcons';

export type NavTab = 'home' | 'expenses' | 'goals';

interface BottomIslandNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomIslandNav: React.FC<BottomIslandNavProps> = ({
  currentTab,
  onTabChange,
}) => {
  return (
    <View style={styles.islandWrapper}>
      <View style={styles.islandContainer}>
        {/* Home Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onTabChange('home')}
          activeOpacity={0.7}
        >
          <HomeIcon
            size={20}
            color={currentTab === 'home' ? '#FAFAFA' : '#71717A'}
          />
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'home' ? styles.activeTabLabel : styles.inactiveTabLabel,
            ]}
          >
            Overview
          </Text>
          {currentTab === 'home' && <View style={styles.activeDot} />}
        </TouchableOpacity>

        {/* Expenses Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onTabChange('expenses')}
          activeOpacity={0.7}
        >
          <ExpensesIcon
            size={20}
            color={currentTab === 'expenses' ? '#FAFAFA' : '#71717A'}
          />
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'expenses' ? styles.activeTabLabel : styles.inactiveTabLabel,
            ]}
          >
            Expenses
          </Text>
          {currentTab === 'expenses' && <View style={styles.activeDot} />}
        </TouchableOpacity>

        {/* Goals Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onTabChange('goals')}
          activeOpacity={0.7}
        >
          <GoalsIcon
            size={20}
            color={currentTab === 'goals' ? '#FAFAFA' : '#71717A'}
          />
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'goals' ? styles.activeTabLabel : styles.inactiveTabLabel,
            ]}
          >
            Goals
          </Text>
          {currentTab === 'goals' && <View style={styles.activeDot} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  islandWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  islandContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 20, 22, 0.94)',
    borderRadius: 24,
    height: 60,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 16,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    position: 'relative',
    height: '100%',
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  activeTabLabel: {
    color: '#FAFAFA',
    fontWeight: '700',
  },
  inactiveTabLabel: {
    color: '#71717A',
    fontWeight: '500',
  },
  activeDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FAFAFA',
  },
});
