import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { Budget } from '../types';

interface SpendingBreakdownProps {
  budgets: Budget[];
  onOpenSetBudget?: (categoryId?: string) => void;
}

const MONO_FONT = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export const SpendingBreakdown: React.FC<SpendingBreakdownProps> = ({
  budgets,
  onOpenSetBudget,
}) => {
  return (
    <View style={styles.sectionContainer}>
      {/* Header: Row flex justify-between items-baseline px-1 mb-2 */}
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>// 02. BUDGET ALLOCATIONS</Text>
        <TouchableOpacity
          onPress={() => onOpenSetBudget?.()}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.actionLink}>[ + SET LIMIT ]</Text>
        </TouchableOpacity>
      </View>

      {budgets.length === 0 ? (
        <TouchableOpacity
          style={styles.emptyDashedBox}
          onPress={() => onOpenSetBudget?.()}
          activeOpacity={0.75}
        >
          <Text style={styles.emptyTitle}>NO ACTIVE CONSTRAINTS</Text>
          <Text style={styles.emptySubtext}>
            Tap to allocate category spending caps
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.budgetsList}>
          {budgets.map((b, index) => {
            const percentage = Math.min((b.spent / b.amount) * 100, 100);
            const isCritical = b.spent / b.amount >= 0.9;
            const isLast = index === budgets.length - 1;

            return (
              <TouchableOpacity
                key={b.id}
                style={[styles.budgetItem, !isLast && styles.itemDivider]}
                onPress={() => onOpenSetBudget?.(b.category_id)}
                activeOpacity={0.7}
              >
                {/* Category Name & Spent/Cap Monospace */}
                <View style={styles.specRow}>
                  <View style={styles.nameGroup}>
                    <View
                      style={[styles.colorSquare, { backgroundColor: b.color || '#FFFFFF' }]}
                    />
                    <Text style={styles.categoryName}>{b.category_name}</Text>
                  </View>
                  <Text style={styles.amountFigures}>
                    <Text style={isCritical ? styles.overAmount : styles.spentAmount}>
                      €{b.spent.toLocaleString()}
                    </Text>{' '}
                    <Text style={styles.capDivider}>/</Text> €{b.amount.toLocaleString()}
                  </Text>
                </View>

                {/* Minimal 2px hairline progress track */}
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${percentage}%`,
                        backgroundColor: isCritical ? colors.outflow : '#FFFFFF',
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: '#080808',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(39, 39, 42, 0.7)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 2,
    marginBottom: 12,
  },
  eyebrow: {
    fontFamily: MONO_FONT,
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#71717A', // text-zinc-500
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  actionLink: {
    fontFamily: MONO_FONT,
    fontSize: 11,
    fontWeight: '700',
    color: '#A1A1AA', // text-zinc-400
    letterSpacing: 0.5,
  },
  emptyDashedBox: {
    borderWidth: 1,
    borderColor: '#27272A', // border-zinc-800
    borderStyle: 'dashed',
    borderRadius: 12, // rounded-xl
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(24, 24, 27, 0.2)',
  },
  emptyTitle: {
    fontFamily: MONO_FONT,
    fontSize: 12,
    fontWeight: '700',
    color: '#A1A1AA', // text-zinc-400
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#52525B', // text-zinc-600
    marginTop: 4,
    textAlign: 'center',
  },
  budgetsList: {
    backgroundColor: 'transparent',
  },
  budgetItem: {
    paddingVertical: 10,
  },
  itemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(39, 39, 42, 0.4)',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorSquare: {
    width: 6,
    height: 6,
    borderRadius: 1,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  amountFigures: {
    fontFamily: MONO_FONT,
    fontSize: 12,
    color: '#71717A',
    fontVariant: ['tabular-nums'],
  },
  capDivider: {
    color: '#3F3F46',
  },
  spentAmount: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  overAmount: {
    color: colors.outflow,
    fontWeight: '700',
  },
  track: {
    height: 2,
    backgroundColor: '#18181B', // bg-zinc-900
    borderRadius: 1,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 1,
  },
});
