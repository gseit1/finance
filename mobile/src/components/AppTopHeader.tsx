import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PulseDot, UserIcon } from './VectorIcons';

export interface AppTopHeaderProps {
  title: string;
  showPulse?: boolean;
  avatarUrl?: string | null;
  onProfilePress?: () => void;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
}

export const AppTopHeader: React.FC<AppTopHeaderProps> = ({
  title,
  showPulse = false,
  avatarUrl,
  onProfilePress,
  onBackPress,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();

  // Enforce strict Android status bar + notch safe offset
  const androidBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0;
  const safeTopPadding = Math.max(insets.top, androidBarHeight, 36) + 6;

  const isImageUri =
    avatarUrl &&
    (avatarUrl.startsWith('http') ||
      avatarUrl.startsWith('file:') ||
      avatarUrl.startsWith('data:') ||
      avatarUrl.startsWith('content:'));

  const getPresetGlyph = (val: string) => {
    switch (val) {
      case 'preset:titan':
        return '⚡';
      case 'preset:vault':
        return '🛡️';
      case 'preset:orbit':
        return '🪐';
      case 'preset:matrix':
        return '💎';
      default:
        return '⚡';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: safeTopPadding }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.innerRow}>
        {/* Left Side: Back Button OR Title */}
        {onBackPress ? (
          <View style={styles.backTitleGroup}>
            <TouchableOpacity
              onPress={onBackPress}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>

            <View style={styles.titleWithPulse}>
              <Text style={styles.headerTitle}>{title}</Text>
              {showPulse && <PulseDot />}
            </View>
          </View>
        ) : (
          <View style={styles.titleWithPulse}>
            <Text style={styles.headerTitle}>{title}</Text>
            {showPulse && <PulseDot />}
          </View>
        )}

        {/* Right Side: Profile Link Button with User Avatar OR Custom Action */}
        {rightAction ? (
          rightAction
        ) : onProfilePress ? (
          <TouchableOpacity
            style={[
              styles.profileLinkButton,
              isImageUri && styles.profileLinkButtonWithImage,
            ]}
            onPress={onProfilePress}
            activeOpacity={0.75}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isImageUri ? (
              <Image source={{ uri: avatarUrl! }} style={styles.profileAvatarImage} />
            ) : avatarUrl && avatarUrl.startsWith('preset:') ? (
              <Text style={styles.profilePresetGlyph}>{getPresetGlyph(avatarUrl)}</Text>
            ) : (
              <UserIcon size={18} color="#FAFAFA" />
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 38 }} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#09090B',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  innerRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 18,
    color: '#FAFAFA',
    fontWeight: '700',
    marginTop: -2,
  },
  titleWithPulse: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FAFAFA',
    letterSpacing: -0.8,
  },
  profileLinkButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#141416',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileLinkButtonWithImage: {
    borderColor: '#10B981',
    borderWidth: 1.5,
  },
  profileAvatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  profilePresetGlyph: {
    fontSize: 18,
  },
});
