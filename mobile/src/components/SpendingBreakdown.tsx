import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { Budget } from '../types';

interface SpendingBreakdownProps {
  budgets: Budget[];
  onOpenSetBudget?: (categoryId?: string) => void;
}

export const SpendingBreakdown: React.FC<SpendingBreakdownProps> = ({
  budgets,
  onOpenSetBudget,
}) => {
  return (
    <View style={styles.container}>
      {/* Header with Title & Action Button */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>MONTHLY BUDGETS</Text>
        <TouchableOpacity
          onPress={() => onOpenSetBudget?.()}
          style={styles.setLimitBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.setLimitBtnText}>+ SET LIMIT</Text>
        </TouchableOpacity>
      </View>

      {budgets.length === 0 ? (
        <TouchableOpacity
          style={styles.emptyContainer}
          onPress={() => onOpenSetBudget?.()}
          activeOpacity={0.8}
        >
          <Text style={styles.emptyEyebrow}>NO ACTIVE BUDGET LIMITS</Text>
          <Text style={styles.emptySubtext}>
            Define category spending caps to enforce fiscal discipline.
          </Text>
          <View style={styles.emptyAddBadge}>
            <Text style={styles.emptyAddBadgeText}>+ CREATE BUDGET LIMIT</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.listContainer}>
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
                <View style={styles.row}>
                  <View style={styles.nameRow}>
                    <View
                      style={[styles.colorIndicator, { backgroundColor: b.color || '#FAFAFA' }]}
                    />
                    <Text style={styles.categoryName}>{b.category_name}</Text>
                  </View>
                  <Text style={styles.amountFigures}>
                    <Text style={isCritical ? styles.overAmount : styles.spentAmount}>
                      ${b.spent.toLocaleString()}
                    </Text>{' '}
                    / ${b.amount.toLocaleString()}
                  </Text>
                </View>

                {/* Minimal 3px hairline progress track */}
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${percentage}%`,
                        backgroundColor: isCritical ? colors.outflow : '#FAFAFA',
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
  container: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eyebrow: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textMuted,
    fontWeight: '700',
  },
  setLimitBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  setLimitBtnText: {
    fontFamily: 'monospace',
    fontSize: 9.5,
    fontWeight: '700',
    color: '#FAFAFA',
    letterSpacing: 0.8,
  },
  listContainer: {
    backgroundColor: 'transparent',
  },
  emptyContainer: {
    backgroundColor: '#141416',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderStyle: 'dashed',
  },
  emptyEyebrow: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#A1A1AA',
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#71717A',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  emptyAddBadge: {
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  emptyAddBadgeText: {
    color: '#09090B',
    fontFamily: 'monospace',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  budgetItem: {
    paddingVertical: 12,
  },
  itemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FAFAFA',
    letterSpacing: -0.2,
  },
  amountFigures: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  spentAmount: {
    color: '#FAFAFA',
    fontWeight: '700',
  },
  overAmount: {
    color: colors.outflow,
    fontWeight: '700',
  },
  track: {
    height: 3,
    backgroundColor: '#27272A',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 1.5,
  },
});
