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
import { GridMenuIcon, UserIcon } from './VectorIcons';
import { fonts } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';

export interface AppTopHeaderProps {
  title?: string;
  subtitle?: string;
  showPulse?: boolean;
  avatarUrl?: string | null;
  userName?: string;
  onProfilePress?: () => void;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  rightAction?: React.ReactNode;
}

export const AppTopHeader: React.FC<AppTopHeaderProps> = ({
  title,
  avatarUrl,
  onProfilePress,
  onBackPress,
  onMenuPress,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useTheme();

  const androidBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;
  const safeTopPadding = Math.max(insets.top, androidBarHeight, 16);

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

  // Right side: prefer rightAction prop, else show theme toggle + avatar
  const rightContent = rightAction ? (
    <View style={styles.rightGroup}>
      {rightAction}
      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: theme.iconButtonBg, borderColor: theme.iconButtonBorder }]}
        onPress={toggleTheme}
        activeOpacity={0.7}
      >
        <Text style={[styles.themeToggleIcon]}>{isDark ? '☀️' : '🌙'}</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <View style={styles.rightGroup}>
      {/* Theme toggle */}
      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: theme.iconButtonBg, borderColor: theme.iconButtonBorder }]}
        onPress={toggleTheme}
        activeOpacity={0.7}
      >
        <Text style={styles.themeToggleIcon}>{isDark ? '☀️' : '🌙'}</Text>
      </TouchableOpacity>

      {/* Profile avatar */}
      {onProfilePress && (
        <TouchableOpacity
          style={[styles.avatarButton, { backgroundColor: theme.iconButtonBg, borderColor: theme.iconButtonBorder }]}
          onPress={onProfilePress}
          activeOpacity={0.8}
        >
          {isImageUri ? (
            <Image source={{ uri: avatarUrl! }} style={styles.avatarImage} />
          ) : avatarUrl && avatarUrl.startsWith('preset:') ? (
            <Text style={styles.presetGlyph}>{getPresetGlyph(avatarUrl)}</Text>
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: theme.track }]}>
              <UserIcon size={16} color={theme.iconButtonColor} />
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: safeTopPadding }]}>
      <StatusBar barStyle={theme.statusBar} />

      <View style={styles.headerRow}>
        {/* Left: 4-square Grid Icon or Back Button */}
        {onBackPress ? (
          <TouchableOpacity
            onPress={onBackPress}
            style={[styles.iconButton, { backgroundColor: theme.iconButtonBg, borderColor: theme.iconButtonBorder }]}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.backChevron, { color: theme.textPrimary }]}>‹</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onMenuPress}
            style={[styles.iconButton, { backgroundColor: theme.iconButtonBg, borderColor: theme.iconButtonBorder }]}
            activeOpacity={0.7}
          >
            <GridMenuIcon size={18} color={theme.iconButtonColor} />
          </TouchableOpacity>
        )}

        {/* Center: Page Title or Welcome Text */}
        {title ? (
          <View style={styles.titleContainer}>
            <Text style={[styles.titleText, { color: theme.textPrimary }]} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {rightContent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 4,
  },
  headerRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  backChevron: {
    fontSize: 26,
    fontWeight: '300',
    marginTop: -2,
  },
  themeToggleIcon: {
    fontSize: 18,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontFamily: fonts.heading,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetGlyph: {
    fontSize: 20,
  },
});
