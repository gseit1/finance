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
import { fonts } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';

interface ProfileScreenProps {
  onBack: () => void;
  onSignOut: () => void;
  onProfileUpdated?: (updatedUser: any) => void;
}

const GLYPH_PRESETS = [
  { id: 'preset:titan', label: '⚡ Titan', color: '#059669', glyph: '⚡' },
  { id: 'preset:vault', label: '🛡️ Vault', color: '#0A0A0A', glyph: '🛡️' },
  { id: 'preset:orbit', label: '🪐 Orbit', color: '#71717A', glyph: '🪐' },
  { id: 'preset:matrix', label: '💎 Diamond', color: '#0284C7', glyph: '💎' },
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
  const { theme } = useTheme();
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
        setStatusMessage({ text: 'Η εικόνα επιλέχθηκε. Πατήστε Αποθήκευση Αλλαγών.', type: 'success' });
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
        setStatusMessage({ text: 'Ο κωδικός πρόσβασης πρέπει να έχει τουλάχιστον 6 χαρακτήρες.', type: 'error' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setStatusMessage({ text: 'Οι κωδικοί δεν ταιριάζουν.', type: 'error' });
        return;
      }
    }

    setSaving(true);
    const nameToSave = displayName.trim() || 'Χρήστης';

    const res = await authService.updateProfile({
      displayName: nameToSave,
      avatarUrl: avatarUri,
      newPassword: newPassword ? newPassword : undefined,
    });

    setSaving(false);

    if (res.success) {
      setStatusMessage({ text: 'Το προφίλ ενημερώθηκε επιτυχώς.', type: 'success' });
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
      setStatusMessage({ text: res.error || 'Αποτυχία ενημέρωσης προφίλ.', type: 'error' });
    }
  };

  const handleSignOutPress = () => {
    Alert.alert(
      'Κλείδωμα & Αποσύνδεση',
      'Είστε βέβαιοι ότι θέλετε να αποσυνδεθείτε από το σύστημα;',
      [
        { text: 'Ακύρωση', style: 'cancel' },
        {
          text: 'Αποσύνδεση',
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header matching all screens */}
      <AppTopHeader
        title="Προφίλ & Ρυθμίσεις"
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

        {/* Pure Pink Hero Identity Card */}
        <View style={[styles.card, { backgroundColor: theme.brandPink, borderWidth: 0 }]}>
          <Text style={[styles.cardEyebrow, { color: 'rgba(255, 255, 255, 0.85)' }]}>ΣΤΟΙΧΕΙΑ ΧΡΗΣΤΗ</Text>

          <View style={styles.avatarRow}>
            {/* Glowing Avatar Frame */}
            <View style={styles.avatarGlowCircle}>
              {isImageUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
              ) : (
                <View style={[styles.avatarGlyphBox, { backgroundColor: 'rgba(255, 255, 255, 0.20)' }]}>
                  <Text style={styles.avatarGlyphLarge}>{activeGlyph.glyph}</Text>
                </View>
              )}
            </View>

            {/* Identity Info */}
            <View style={styles.avatarInfoCol}>
              <Text style={[styles.avatarNameText, { color: '#FFFFFF' }]} numberOfLines={1}>
                {displayName || 'Χρήστης'}
              </Text>
              <Text style={[styles.avatarEmailText, { color: 'rgba(255, 255, 255, 0.85)' }]} numberOfLines={1}>
                {email || 'user@finance.app'}
              </Text>
              <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(255, 255, 255, 0.20)' }]}>
                <View style={[styles.greenDot, { backgroundColor: '#A7F3D0' }]} />
                <Text style={[styles.verifiedBadgeText, { color: '#FFFFFF' }]}>ΕΠΑΛΗΘΕΥΜΕΝΗ ΠΡΟΣΒΑΣΗ</Text>
              </View>
            </View>
          </View>

          {/* Action Row for Avatar */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.primaryActionButton, { backgroundColor: '#FFFFFF' }]}
              onPress={handlePickFromGallery}
              activeOpacity={0.88}
            >
              <Text style={[styles.primaryActionText, { color: theme.brandPink }]}>Ανέβασμα Εικόνας</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryActionButton, { backgroundColor: 'rgba(255, 255, 255, 0.20)', borderColor: 'rgba(255, 255, 255, 0.35)' }]}
              onPress={() => setGalleryModalVisible(true)}
              activeOpacity={0.75}
            >
              <Text style={[styles.secondaryActionText, { color: '#FFFFFF' }]}>Έτοιμα Avatars</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3-Column Unified Data Strip Card */}
        <View style={[styles.dataStripCard, { backgroundColor: theme.surface, borderWidth: 0 }]}>
          <View style={styles.dataCol}>
            <Text style={[styles.dataLabel, { color: theme.textMuted }]}>ΚΡΥΠΤΟΓΡΑΦΗΣΗ</Text>
            <Text style={[styles.dataValue, { color: theme.textPrimary }]}>AES-256</Text>
          </View>

          <View style={[styles.dataDivider, { backgroundColor: theme.hairline }]} />

          <View style={styles.dataCol}>
            <Text style={[styles.dataLabel, { color: theme.textMuted }]}>ΣΥΝΕΔΡΙΑ</Text>
            <Text style={[styles.dataValue, { color: theme.emerald }]}>ΕΝΕΡΓΗ</Text>
          </View>

          <View style={[styles.dataDivider, { backgroundColor: theme.hairline }]} />

          <View style={styles.dataCol}>
            <Text style={[styles.dataLabel, { color: theme.textMuted }]}>ΒΑΣΗ</Text>
            <Text style={[styles.dataValue, { color: theme.textPrimary }]}>POSTGRES</Text>
          </View>
        </View>

        {/* Personal Details Card */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderWidth: 0 }]}>
          <Text style={[styles.cardEyebrow, { color: theme.textMuted }]}>ΠΡΟΣΩΠΙΚΑ ΣΤΟΙΧΕΙΑ</Text>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>ΟΝΟΜΑΤΕΠΩΝΥΜΟ / ΨΕΥΔΩΝΥΜΟ</Text>
            <View style={[styles.inputBox, { backgroundColor: theme.inputBg, borderColor: theme.hairline }]}>
              <TextInput
                style={[styles.textInput, { color: theme.inputText }]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="π.χ. Γιώργος Παπαδόπουλος"
                placeholderTextColor={theme.inputPlaceholder}
              />
            </View>
          </View>

          <View style={[styles.fieldGroup, { marginTop: 12 }]}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>ΕΓΓΕΓΡΑΜΜΕΝΟ EMAIL (ΜΟΝΟ ΓΙΑ ΑΝΑΓΝΩΣΗ)</Text>
            <View style={[styles.inputBox, styles.inputBoxDisabled, { backgroundColor: theme.track, borderColor: theme.hairline }]}>
              <TextInput
                style={[styles.textInput, { color: theme.textMuted }]}
                value={email}
                editable={false}
              />
            </View>
          </View>
        </View>

        {/* Security & Master Key Card */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderWidth: 0 }]}>
          <Text style={[styles.cardEyebrow, { color: theme.textMuted }]}>ΑΣΦΑΛΕΙΑ & ΚΩΔΙΚΟΣ ΠΡΟΣΒΑΣΗΣ</Text>

          <View style={styles.fieldGroup}>
            <View style={styles.fieldLabelRow}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>ΝΕΟΣ ΚΩΔΙΚΟΣ ΠΡΟΣΒΑΣΗΣ</Text>
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.revealText, { color: theme.brandPink }]}>{showPassword ? 'ΑΠΟΚΡΥΨΗ' : 'ΕΜΦΑΝΙΣΗ'}</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.inputBox, { backgroundColor: theme.inputBg, borderColor: theme.hairline }]}>
              <TextInput
                style={[styles.textInput, { color: theme.inputText }]}
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Εισαγωγή νέου κωδικού (ελάχ. 6 χαρακτήρες)"
                placeholderTextColor={theme.inputPlaceholder}
              />
            </View>
          </View>

          {newPassword.length > 0 && (
            <View style={[styles.fieldGroup, { marginTop: 12 }]}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>ΕΠΙΒΕΒΑΙΩΣΗ ΝΕΟΥ ΚΩΔΙΚΟΥ</Text>
              <View style={[styles.inputBox, { backgroundColor: theme.inputBg, borderColor: theme.hairline }]}>
                <TextInput
                  style={[styles.textInput, { color: theme.inputText }]}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Επιβεβαίωση κωδικού"
                  placeholderTextColor={theme.inputPlaceholder}
                />
              </View>
            </View>
          )}
        </View>

        {/* Primary Save Action */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.brandPink }]}
          onPress={handleSave}
          activeOpacity={0.88}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={[styles.saveButtonText, { color: '#FFFFFF' }]}>Αποθήκευση Αλλαγών</Text>
          )}
        </TouchableOpacity>

        {/* Secondary Sign Out Action */}
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: theme.crimsonBg, borderColor: theme.crimsonBorder }]}
          onPress={handleSignOutPress}
          activeOpacity={0.8}
        >
          <Text style={[styles.signOutButtonText, { color: theme.crimson }]}>ΚΛΕΙΔΩΜΑ & ΑΠΟΣΥΝΔΕΣΗ</Text>
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
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Επιλογή Avatar</Text>
              <TouchableOpacity
                onPress={() => setGalleryModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.modalCloseText, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: theme.textMuted }]}>ΕΠΙΛΕΓΜΕΝΑ ΠΟΡΤΡΑΙΤΑ</Text>
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

            <Text style={[styles.modalSub, { color: theme.textMuted }]}>ΣΥΜΒΟΛΑ & GLYPHS</Text>
            <View style={styles.glyphGrid}>
              {GLYPH_PRESETS.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.glyphGridItem,
                    { backgroundColor: theme.track },
                    avatarUri === p.id && { borderColor: p.color, backgroundColor: p.color + '20' },
                  ]}
                  onPress={() => {
                    setAvatarUri(p.id);
                    setGalleryModalVisible(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.glyphGridGlyph}>{p.glyph}</Text>
                  <Text style={[styles.glyphGridLabel, { color: theme.textSecondary }]}>{p.label.split(' ')[1]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.modalSub, { color: theme.textMuted }]}>Η ΕΠΙΚΟΛΛΗΣΗ URL ΕΙΚΟΝΑΣ</Text>
            <View style={styles.urlInputRow}>
              <TextInput
                style={[styles.customUrlInput, { backgroundColor: theme.inputBg, borderColor: theme.hairline, color: theme.inputText }]}
                placeholder="https://..."
                placeholderTextColor={theme.inputPlaceholder}
                value={customUrlInput}
                onChangeText={setCustomUrlInput}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.applyUrlBtn, { backgroundColor: theme.brandPink }]}
                onPress={() => {
                  if (customUrlInput.trim()) {
                    setAvatarUri(customUrlInput.trim());
                    setGalleryModalVisible(false);
                    setCustomUrlInput('');
                  }
                }}
              >
                <Text style={styles.applyUrlText}>Χρήση</Text>
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
    backgroundColor: '#F7F7F8',
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
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  feedbackError: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
  },
  feedbackText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    marginBottom: 16,
  },
  cardEyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: '#71717A',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 14,
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
    borderWidth: 1,
    borderColor: '#E4E4E7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#F4F4F5',
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
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '900',
    color: '#0A0A0A',
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  avatarEmailText: {
    fontFamily: fonts.bodyLight,
    fontSize: 12,
    color: '#71717A',
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  verifiedBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 0.5,
    color: '#059669',
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
    backgroundColor: '#0A0A0A',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    fontFamily: fonts.bodyBold,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  secondaryActionButton: {
    width: 94,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    fontFamily: fonts.bodyMedium,
    color: '#0A0A0A',
    fontSize: 12.5,
    fontWeight: '700',
  },
  dataStripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    marginBottom: 16,
  },
  dataCol: {
    flex: 1,
    alignItems: 'center',
  },
  dataLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: '#71717A',
    fontWeight: '700',
    marginBottom: 4,
  },
  dataValue: {
    fontFamily: fonts.heading,
    fontSize: 13,
    fontWeight: '900',
    color: '#0A0A0A',
  },
  dataDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E4E4E7',
  },
  fieldGroup: {
    marginBottom: 6,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: '#71717A',
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  inputBox: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  inputBoxDisabled: {
    opacity: 0.75,
    backgroundColor: '#F4F4F5',
  },
  textInput: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#0A0A0A',
    padding: 0,
    fontWeight: '500',
  },
  revealText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: '#0A0A0A',
    fontWeight: '700',
  },
  saveButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  saveButtonText: {
    fontFamily: fonts.bodyBold,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  signOutButton: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECDD3',
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutButtonText: {
    fontFamily: fonts.bodyBold,
    color: '#E11D48',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    fontWeight: '800',
    color: '#0A0A0A',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#71717A',
    padding: 4,
  },
  modalSub: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: '#71717A',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    borderColor: '#0A0A0A',
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
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  glyphGridGlyph: {
    fontSize: 18,
    marginBottom: 2,
  },
  glyphGridLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: '#71717A',
    fontWeight: '600',
  },
  urlInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  customUrlInput: {
    fontFamily: fonts.body,
    flex: 1,
    height: 44,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0A0A0A',
  },
  applyUrlBtn: {
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyUrlText: {
    fontFamily: fonts.bodyBold,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
