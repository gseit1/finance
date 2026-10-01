import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { fonts } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';
import { Transaction } from '../types';
import { TrashIcon } from './VectorIcons';
import { KineticPressable } from './KineticPressable';

interface DeleteTransactionModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onConfirmDelete: (txId: string) => void;
}

export const DeleteTransactionModal: React.FC<DeleteTransactionModalProps> = ({
  visible,
  transaction,
  onClose,
  onConfirmDelete,
}) => {
  const { theme, isDark } = useTheme();

  if (!transaction) return null;

  const isIncome = transaction.type === 'income';

  const handleDelete = () => {
    onConfirmDelete(transaction.id);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.surfaceBorder,
                },
              ]}
            >
              {/* Top Warning / Trash Badge */}
              <View
                style={[
                  styles.trashBadge,
                  {
                    backgroundColor: isDark ? '#2D0A14' : '#FFF1F2',
                    borderColor: isDark ? '#4C0519' : '#FECDD3',
                  },
                ]}
              >
                <TrashIcon size={24} color="#E11D48" />
              </View>

              {/* Title & Description */}
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                Διαγραφή Συναλλαγής
              </Text>
              <Text style={[styles.modalSubtext, { color: theme.textSecondary }]}>
                Είστε βέβαιοι ότι θέλετε να διαγράψετε τη συναλλαγή; Η ενέργεια αυτή δεν μπορεί να αναιρεθεί.
              </Text>

              {/* Transaction Preview Card */}
              <View
                style={[
                  styles.previewCard,
                  {
                    backgroundColor: isDark ? '#1C1C1F' : '#F9F9FB',
                    borderColor: theme.hairline,
                  },
                ]}
              >
                <View style={styles.previewLeft}>
                  <Text
                    style={[styles.previewDesc, { color: theme.textPrimary }]}
                    numberOfLines={1}
                  >
                    {transaction.description || 'Συναλλαγή'}
                  </Text>
                  <Text
                    style={[styles.previewMeta, { color: theme.textMuted }]}
                    numberOfLines={1}
                  >
                    {transaction.category_name || 'Γενικά'} · {transaction.account_name || 'Λογαριασμός'}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.previewAmount,
                    { color: isIncome ? theme.emerald : theme.crimson },
                  ]}
                >
                  {isIncome ? '+' : '−'}€{transaction.amount.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    {
                      backgroundColor: isDark ? '#27272A' : '#FFFFFF',
                      borderColor: theme.hairline,
                    },
                  ]}
                  onPress={onClose}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.textPrimary }]}>
                    Ακύρωση
                  </Text>
                </TouchableOpacity>

                <KineticPressable
                  style={styles.deleteButton}
                  onPress={handleDelete}
                >
                  <Text style={styles.deleteButtonText}>Διαγραφή</Text>
                </KineticPressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  trashBadge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSubtext: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 18,
  },
  previewCard: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  previewLeft: {
    flex: 1,
    marginRight: 12,
  },
  previewDesc: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  previewMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
  },
  previewAmount: {
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '900',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    fontWeight: '700',
  },
  deleteButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E11D48',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
