import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Budget } from '../types';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/typography';

interface SpendingBreakdownProps {
  budgets: Budget[];
  onOpenSetBudget?: (categoryId?: string) => void;
}

export const SpendingBreakdown: React.FC<SpendingBreakdownProps> = ({
  budgets,
  onOpenSetBudget,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Κατανομή Προϋπολογισμού</Text>
        <TouchableOpacity
          onPress={() => onOpenSetBudget?.()}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.actionLink, { color: theme.textPrimary }]}>+ Όριο</Text>
        </TouchableOpacity>
      </View>

      {budgets.length === 0 ? (
        <TouchableOpacity
          style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.hairline }]}
          onPress={() => onOpenSetBudget?.()}
          activeOpacity={0.75}
        >
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Δεν υπάρχουν ενεργά όρια</Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Πατήστε για να ορίσετε μηνιαία όρια δαπανών ανά κατηγορία
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.cardContainer, { backgroundColor: theme.surface, borderColor: theme.hairline }]}>
          {budgets.map((b, index) => {
            const percentage = Math.min((b.spent / b.amount) * 100, 100);
            const isCritical = b.spent / b.amount >= 0.9;
            const isLast = index === budgets.length - 1;

            return (
              <TouchableOpacity
                key={b.id}
                style={[styles.budgetItem, !isLast && [styles.itemDivider, { borderBottomColor: theme.hairlineFaint }]]}
                onPress={() => onOpenSetBudget?.(b.category_id)}
                activeOpacity={0.7}
              >
                <View style={styles.specRow}>
                  <View style={styles.nameGroup}>
                    <View
                      style={[
                        styles.colorDot,
                        { backgroundColor: b.color || theme.textPrimary },
                      ]}
                    />
                    <Text style={[styles.categoryName, { color: theme.textPrimary }]}>{b.category_name}</Text>
                  </View>
                  <Text style={[styles.amountFigures, { color: theme.textSecondary }]}>
                    <Text style={isCritical ? { color: theme.crimson, fontWeight: '700' } : { color: theme.textPrimary, fontWeight: '700' }}>
                      €{b.spent.toLocaleString('el-GR')}
                    </Text>{' '}
                    <Text style={{ color: theme.textMuted }}>/</Text> €{b.amount.toLocaleString('el-GR')}
                  </Text>
                </View>

                {/* Progress Track */}
                <View style={[styles.track, { backgroundColor: theme.track }]}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${percentage}%`,
                        backgroundColor: isCritical ? theme.crimson : theme.textPrimary,
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  actionLink: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emptyTitle: {
    fontFamily: fonts.heading,
    fontSize: 14,
    fontWeight: '700',
  },
  emptySubtext: {
    fontFamily: fonts.bodyLight,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  cardContainer: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  budgetItem: {
    paddingVertical: 12,
  },
  itemDivider: {
    borderBottomWidth: 1,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    fontWeight: '700',
  },
  amountFigures: {
    fontFamily: fonts.body,
    fontSize: 13,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
