import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onSelectTransaction?: (tx: Transaction) => void;
}

const MONO_FONT = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onSelectTransaction,
}) => {
  const formatAmount = (tx: Transaction) => {
    const isIncome = tx.type === 'income';
    const prefix = isIncome ? '+' : '-';
    return `${prefix}€${tx.amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.sectionContainer}>
      {/* Header: // 03. RECENT ACTIVITY */}
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>// 03. RECENT ACTIVITY</Text>
      </View>

      {transactions.length === 0 ? (
        <View style={styles.emptyDashedBox}>
          <Text style={styles.emptyTitle}>NO RECORDED TRANSACTIONS</Text>
          <Text style={styles.emptySubtext}>Stream waiting for incoming ledger activity</Text>
        </View>
      ) : (
        <View style={styles.streamList}>
          {transactions.map((tx, index) => {
            const isIncome = tx.type === 'income';
            const isLast = index === transactions.length - 1;
            const initialTag = (tx.category_name || tx.description || 'D')
              .trim()
              .slice(0, 1)
              .toUpperCase();

            const subSpecParts = [
              tx.category_name || 'General',
              tx.account_name || 'Account',
              formatDate(tx.date),
            ].filter(Boolean);

            return (
              <TouchableOpacity
                key={tx.id}
                style={[styles.streamRow, !isLast && styles.rowDivider]}
                activeOpacity={0.7}
                onPress={() => onSelectTransaction?.(tx)}
              >
                {/* Micro square category tag: [ D ] */}
                <View style={styles.categoryMicroTag}>
                  <Text style={styles.categoryMicroText}>[ {initialTag} ]</Text>
                </View>

                {/* Center: Entity name + Sub-spec */}
                <View style={styles.specCenter}>
                  <Text style={styles.entityName} numberOfLines={1}>
                    {tx.description || 'Transaction'}
                  </Text>
                  <Text style={styles.subSpecText} numberOfLines={1}>
                    {subSpecParts.join(' · ')}
                  </Text>
                </View>

                {/* Right: Crisp tabular monospace figure */}
                <Text
                  style={[
                    styles.amountFigure,
                    isIncome ? styles.inflowAmount : styles.whiteAmount,
                  ]}
                >
                  {formatAmount(tx)}
                </Text>
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
    paddingBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(39, 39, 42, 0.7)',
  },
  headerRow: {
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  eyebrow: {
    fontFamily: MONO_FONT,
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#71717A', // text-zinc-500
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyDashedBox: {
    borderWidth: 1,
    borderColor: '#27272A', // border-zinc-800
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(24, 24, 27, 0.2)',
  },
  emptyTitle: {
    fontFamily: MONO_FONT,
    fontSize: 11,
    fontWeight: '700',
    color: '#A1A1AA',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#52525B',
    marginTop: 4,
  },
  streamList: {
    backgroundColor: 'transparent',
  },
  streamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14, // py-3.5
    paddingHorizontal: 4,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#18181B', // border-zinc-900
  },
  categoryMicroTag: {
    width: 32, // w-8
    height: 32, // h-8
    borderRadius: 8, // rounded-lg
    backgroundColor: '#18181B', // bg-zinc-900
    borderWidth: 1,
    borderColor: '#27272A', // border-zinc-800
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryMicroText: {
    fontFamily: MONO_FONT,
    fontSize: 10, // text-[10px]
    fontWeight: '900', // font-black
    color: '#D4D4D8', // text-zinc-300
    letterSpacing: -0.5,
  },
  specCenter: {
    flex: 1,
    paddingRight: 10,
  },
  entityName: {
    fontSize: 14,
    fontWeight: '700', // font-bold
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  subSpecText: {
    fontFamily: MONO_FONT,
    fontSize: 11, // text-xs
    color: '#71717A', // text-zinc-500
    marginTop: 2, // mt-0.5
  },
  amountFigure: {
    fontFamily: MONO_FONT,
    fontSize: 14, // text-sm
    fontWeight: '900', // font-black
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
  },
  whiteAmount: {
    color: '#FFFFFF',
  },
  inflowAmount: {
    color: '#10B981',
  },
});
