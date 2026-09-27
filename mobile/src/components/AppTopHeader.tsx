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
import { UserIcon } from './VectorIcons';

export interface AppTopHeaderProps {
  title?: string;
  showPulse?: boolean;
  avatarUrl?: string | null;
  userName?: string;
  onProfilePress?: () => void;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
}

const MONO_FONT = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export const AppTopHeader: React.FC<AppTopHeaderProps> = ({
  title,
  avatarUrl,
  onProfilePress,
  onBackPress,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();

  // Rigid status bar height with notch safe offset
  const androidBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;
  const safeTopPadding = Math.max(insets.top, androidBarHeight, 20);

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

      <View style={styles.statusBarRow}>
        {/* Left: LEDGER.SYS or [ ← BACK ] */}
        {onBackPress ? (
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.backTouch}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.backText}>← {title ? title.toUpperCase() : 'SYS.NAV'}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.brandGroup}>
            <Text style={styles.brandTitle}>LEDGER.SYS</Text>
          </View>
        )}

        {/* Right: Tactile Profile Link Button */}
        {rightAction ? (
          rightAction
        ) : onProfilePress ? (
          <TouchableOpacity
            style={styles.profileLinkButton}
            onPress={onProfilePress}
            activeOpacity={0.75}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isImageUri ? (
              <Image source={{ uri: avatarUrl! }} style={styles.avatarImage} />
            ) : avatarUrl && avatarUrl.startsWith('preset:') ? (
              <Text style={styles.presetGlyph}>{getPresetGlyph(avatarUrl)}</Text>
            ) : (
              <UserIcon size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 34 }} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#080808',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(39, 39, 42, 0.6)',
  },
  statusBarRow: {
    height: 56, // h-14
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, // px-6
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontFamily: MONO_FONT,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 2,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  backTouch: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontFamily: MONO_FONT,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1.2,
    color: '#FFFFFF',
  },
  profileLinkButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#18181B', // bg-zinc-900
    borderWidth: 1,
    borderColor: '#3F3F46', // border-zinc-700
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 9,
  },
  presetGlyph: {
    fontSize: 16,
  },
});
