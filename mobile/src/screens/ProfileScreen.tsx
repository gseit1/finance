import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { authService } from '../services/authService';
import { AppTopHeader } from '../components/AppTopHeader';
import { colors } from '../theme/colors';

interface ProfileScreenProps {
  onBack: () => void;
  onSignOut: () => void;
  onProfileUpdated?: (updatedUser: any) => void;
}

const GLYPH_PRESETS = [
  { id: 'preset:titan', label: '⚡ Titan', color: '#10B981', glyph: '⚡' },
  { id: 'preset:vault', label: '🛡️ Vault', color: '#6366F1', glyph: '🛡️' },
  { id: 'preset:orbit', label: '🪐 Orbit', color: '#F59E0B', glyph: '🪐' },
  { id: 'preset:matrix', label: '💎 Diamond', color: '#06B6D4', glyph: '💎' },
];

const CURATED_GALLERY_PHOTOS = [
  { id: 'photo-1', label: 'Operator A', uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
  { id: 'photo-2', label: 'Operator B', uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
  { id: 'photo-3', label: 'Operator C', uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80' },
  { id: 'photo-4', label: 'Operator D', uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80' },
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onBack,
  onSignOut,
  onProfileUpdated,
}) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string>('preset:titan');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [galleryModalVisible, setGalleryModalVisible] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setEmail(user.email || 'operator@financial-kernel.com');
        const meta = user.user_metadata || {};
        if (meta.full_name) setDisplayName(meta.full_name);
        if (meta.avatar_url) setAvatarUri(meta.avatar_url);
      }
    } catch (e) {
      console.warn('Error loading profile', e);
    }
  };

  // Launch Native Phone Gallery Picker
  const handlePickFromGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
        maxWidth: 600,
        maxHeight: 600,
        includeBase64: true,
      });

      if (result.didCancel) return;

      if (result.errorCode) {
        console.warn('Image picker notice:', result.errorMessage);
        setGalleryModalVisible(true);
        return;
      }

      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        const pickedUri = result.assets[0].uri;
        setAvatarUri(pickedUri);
        setStatusMessage({ text: 'Image selected from gallery. Tap Save Changes.', type: 'success' });
      }
    } catch (err) {
      console.warn('Native picker notice, opening photo modal:', err);
      setGalleryModalVisible(true);
    }
  };

  const handleSave = async () => {
    setStatusMessage(null);

    if (newPassword) {
      if (newPassword.length < 6) {
        setStatusMessage({ text: 'Master key must be at least 6 characters.', type: 'error' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setStatusMessage({ text: 'Passwords do not match.', type: 'error' });
        return;
      }
    }

    setSaving(true);
    const nameToSave = displayName.trim() || 'Vault Operator';

    const res = await authService.updateProfile({
      displayName: nameToSave,
      avatarUrl: avatarUri,
      newPassword: newPassword ? newPassword : undefined,
    });

    setSaving(false);

    if (res.success) {
      setStatusMessage({ text: 'Profile updated successfully.', type: 'success' });
      setNewPassword('');
      setConfirmPassword('');

      if (onProfileUpdated) {
        onProfileUpdated({
          email,
          user_metadata: {
            full_name: nameToSave,
            avatar_url: avatarUri,
          },
        });
      }

      setTimeout(() => setStatusMessage(null), 3500);
    } else {
      setStatusMessage({ text: res.error || 'Failed to update profile.', type: 'error' });
    }
  };

  const handleSignOutPress = () => {
    Alert.alert(
      'Lock Vault',
      'Are you sure you want to sign out and lock this financial ledger?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Lock & Sign Out',
          style: 'destructive',
          onPress: async () => {
            await authService.signOut();
            onSignOut();
          },
        },
      ]
    );
  };

  const isImageUri =
    avatarUri &&
    (avatarUri.startsWith('http') ||
      avatarUri.startsWith('file:') ||
      avatarUri.startsWith('data:') ||
      avatarUri.startsWith('content:'));

  const activeGlyph =
    GLYPH_PRESETS.find((p) => p.id === avatarUri) || GLYPH_PRESETS[0];

  return (
    <View style={styles.container}>
      {/* Top Header matching all screens */}
      <AppTopHeader
        title="Profile"
        showPulse
        onBackPress={onBack}
        avatarUrl={avatarUri}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 24, 40) },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Status Toast */}
        {statusMessage && (
          <View
            style={[
              styles.feedbackBanner,
              statusMessage.type === 'success' ? styles.feedbackSuccess : styles.feedbackError,
            ]}
          >
            <Text
              style={[
                styles.feedbackText,
                statusMessage.type === 'success' ? { color: '#10B981' } : { color: '#F43F5E' },
              ]}
            >
              {statusMessage.type === 'success' ? '✓ ' : '⚠ '}
              {statusMessage.text}
            </Text>
          </View>
        )}

        {/* Hero Card matching Net Balance / Data Card design */}
        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>OPERATOR IDENTITY</Text>

          <View style={styles.avatarRow}>
            {/* Glowing Avatar Frame */}
            <View style={styles.avatarGlowCircle}>
              {isImageUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
              ) : (
                <View style={[styles.avatarGlyphBox, { backgroundColor: activeGlyph.color + '22' }]}>
                  <Text style={styles.avatarGlyphLarge}>{activeGlyph.glyph}</Text>
                </View>
              )}
            </View>

            {/* Identity Info */}
            <View style={styles.avatarInfoCol}>
              <Text style={styles.avatarNameText} numberOfLines={1}>
                {displayName || 'Vault Operator'}
              </Text>
              <Text style={styles.avatarEmailText} numberOfLines={1}>
                {email || 'operator@financial-kernel.com'}
              </Text>
              <View style={styles.verifiedBadge}>
                <View style={styles.greenDot} />
                <Text style={styles.verifiedBadgeText}>VERIFIED ACCESS</Text>
              </View>
            </View>
          </View>

          {/* Action Row for Avatar: [ Upload Photo ] & [ Presets ] */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={handlePickFromGallery}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryActionText}>Upload Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={() => setGalleryModalVisible(true)}
              activeOpacity={0.75}
            >
              <Text style={styles.secondaryActionText}>Presets</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3-Column Unified Data Strip Card (Matching Expenses & Goals layout) */}
        <View style={styles.dataStripCard}>
          <View style={styles.dataCol}>
            <Text style={styles.dataLabel}>ENCRYPTION</Text>
            <Text style={styles.dataValue}>AES-256</Text>
          </View>

          <View style={styles.dataDivider} />

          <View style={styles.dataCol}>
            <Text style={styles.dataLabel}>SESSION</Text>
            <Text style={[styles.dataValue, { color: colors.inflow }]}>ACTIVE</Text>
          </View>

          <View style={styles.dataDivider} />

          <View style={styles.dataCol}>
            <Text style={styles.dataLabel}>LEDGER</Text>
            <Text style={styles.dataValue}>POSTGRES</Text>
          </View>
        </View>

        {/* Personal Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>PERSONAL DETAILS</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>FULL NAME / ALIAS</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInput}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="e.g. Alex Mercer"
                placeholderTextColor="#52525B"
              />
            </View>
          </View>

          <View style={[styles.fieldGroup, { marginTop: 12 }]}>
            <Text style={styles.fieldLabel}>REGISTERED EMAIL (READ-ONLY)</Text>
            <View style={[styles.inputBox, styles.inputBoxDisabled]}>
              <TextInput
                style={[styles.textInput, { color: '#71717A' }]}
                value={email}
                editable={false}
              />
            </View>
          </View>
        </View>

        {/* Security & Master Key Card */}
        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>VAULT SECURITY & KEY</Text>

          <View style={styles.fieldGroup}>
            <View style={styles.fieldLabelRow}>
              <Text style={styles.fieldLabel}>NEW MASTER KEY</Text>
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.revealText}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInput}
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new master key (min 6 chars)"
                placeholderTextColor="#52525B"
              />
            </View>
          </View>

          {newPassword.length > 0 && (
            <View style={[styles.fieldGroup, { marginTop: 12 }]}>
              <Text style={styles.fieldLabel}>CONFIRM NEW MASTER KEY</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm password"
                  placeholderTextColor="#52525B"
                />
              </View>
            </View>
          )}
        </View>

        {/* Primary Save Action (Crisp White CTA matching the rest of the app) */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.88}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#09090B" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        {/* Secondary Sign Out Action */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOutPress}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutButtonText}>LOCK VAULT & SIGN OUT</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Preset Photo & Glyph Selection Modal */}
      <Modal
        visible={galleryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGalleryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Choose Avatar</Text>
              <TouchableOpacity
                onPress={() => setGalleryModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>CURATED OPERATOR PORTRAITS</Text>
            <View style={styles.photoGrid}>
              {CURATED_GALLERY_PHOTOS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.photoGridItem,
                    avatarUri === item.uri && styles.selectedGridItem,
                  ]}
                  onPress={() => {
                    setAvatarUri(item.uri);
                    setGalleryModalVisible(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: item.uri }} style={styles.gridThumb} />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalSub}>TACTILE FINTECH GLYPHS</Text>
            <View style={styles.glyphGrid}>
              {GLYPH_PRESETS.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.glyphGridItem,
                    avatarUri === p.id && { borderColor: p.color, backgroundColor: p.color + '20' },
                  ]}
                  onPress={() => {
                    setAvatarUri(p.id);
                    setGalleryModalVisible(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.glyphGridGlyph}>{p.glyph}</Text>
                  <Text style={styles.glyphGridLabel}>{p.label.split(' ')[1]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalSub}>OR PASTE CUSTOM IMAGE URL</Text>
            <View style={styles.urlInputRow}>
              <TextInput
                style={styles.customUrlInput}
                placeholder="https://..."
                placeholderTextColor="#52525B"
                value={customUrlInput}
                onChangeText={setCustomUrlInput}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.applyUrlBtn}
                onPress={() => {
                  if (customUrlInput.trim()) {
                    setAvatarUri(customUrlInput.trim());
                    setGalleryModalVisible(false);
                    setCustomUrlInput('');
                  }
                }}
              >
                <Text style={styles.applyUrlText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  feedbackBanner: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
  },
  feedbackSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  feedbackError: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  feedbackText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 16,
  },
  cardEyebrow: {
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 18,
  },
  avatarGlowCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#000000',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarImg: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarGlyphBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlyphLarge: {
    fontSize: 32,
  },
  avatarInfoCol: {
    flex: 1,
  },
  avatarNameText: {
    fontSize: 21,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.6,
    marginBottom: 2,
  },
  avatarEmailText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  verifiedBadgeText: {
    fontFamily: 'monospace',
    fontSize: 8.5,
    letterSpacing: 1,
    color: '#10B981',
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryActionButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionText: {
    color: '#09090B',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  secondaryActionButton: {
    width: 94,
    height: 44,
    backgroundColor: '#1A1A1E',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    color: '#FAFAFA',
    fontSize: 12.5,
    fontWeight: '700',
  },
  dataStripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 16,
  },
  dataCol: {
    flex: 1,
    alignItems: 'center',
  },
  dataLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 1,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 4,
  },
  dataValue: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  dataDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  fieldGroup: {
    marginBottom: 4,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 1.2,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 6,
  },
  inputBox: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#0F0F11',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  inputBoxDisabled: {
    opacity: 0.75,
  },
  textInput: {
    fontSize: 13.5,
    color: colors.textPrimary,
    padding: 0,
    fontWeight: '500',
  },
  revealText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#A1A1AA',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  saveButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#09090B',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  signOutButton: {
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)',
    backgroundColor: 'rgba(244, 63, 94, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutButtonText: {
    color: '#F43F5E',
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  modalCloseText: {
    fontSize: 16,
    color: colors.textMuted,
    padding: 4,
  },
  modalSub: {
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.textMuted,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 10,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  photoGridItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedGridItem: {
    borderColor: '#10B981',
  },
  gridThumb: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  glyphGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  glyphGridItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  glyphGridGlyph: {
    fontSize: 18,
    marginBottom: 2,
  },
  glyphGridLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#A1A1AA',
    fontWeight: '600',
  },
  urlInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  customUrlInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#0F0F11',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    fontSize: 12,
    color: colors.textPrimary,
  },
  applyUrlBtn: {
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyUrlText: {
    color: '#09090B',
    fontSize: 12,
    fontWeight: '800',
  },
});
