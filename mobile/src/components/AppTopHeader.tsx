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

  return (
    <View style={[styles.container, { paddingTop: safeTopPadding }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerRow}>
        {/* Left: 4-square Grid Icon or Back Button */}
        {onBackPress ? (
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.iconButton}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.backChevron}>‹</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onMenuPress}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <GridMenuIcon size={18} color="#0A0A0A" />
          </TouchableOpacity>
        )}

        {/* Center: Page Title or Welcome Text */}
        {title ? (
          <View style={styles.titleContainer}>
            <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {/* Right: Custom action or User Avatar */}
        {rightAction ? (
          rightAction
        ) : onProfilePress ? (
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={onProfilePress}
            activeOpacity={0.8}
          >
            {isImageUri ? (
              <Image source={{ uri: avatarUrl! }} style={styles.avatarImage} />
            ) : avatarUrl && avatarUrl.startsWith('preset:') ? (
              <Text style={styles.presetGlyph}>{getPresetGlyph(avatarUrl)}</Text>
            ) : (
              <View style={styles.avatarFallback}>
                <UserIcon size={16} color="#0A0A0A" />
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 42 }} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7F7F8',
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  backChevron: {
    fontSize: 26,
    fontWeight: '300',
    color: '#0A0A0A',
    marginTop: -2,
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
    color: '#0A0A0A',
    letterSpacing: -0.3,
  },
  avatarButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E4E4E7',
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
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetGlyph: {
    fontSize: 20,
  },
});
