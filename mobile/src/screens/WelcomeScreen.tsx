import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { TitaniumCardVisual } from '../components/TitaniumCardVisual';
import { fonts } from '../theme/typography';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
  onSignIn,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Centerpiece: Dynamic Perspective Visual Card */}
      <View style={styles.centerpieceContainer}>
        <TitaniumCardVisual />
      </View>

      {/* Lower Third: Headline, Narrative & Tactile Action Deck */}
      <View style={styles.contentDeck}>
        <View style={styles.copyBlock}>
          <Text style={styles.headline}>Precision control over every dollar.</Text>
          <Text style={styles.narrative}>
            Real-time ledger dispatch, automated liquidity limits, and sub-second asset tracking.
          </Text>
        </View>

        {/* Action Deck */}
        <View style={styles.actionDeck}>
          <TouchableOpacity
            style={styles.primaryCta}
            onPress={onGetStarted}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryCtaText}>Get Started →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryLink}
            onPress={onSignIn}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryLinkText}>
              Already have an account? <Text style={styles.obsidianHighlight}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F8',
    justifyContent: 'space-between',
  },
  centerpieceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentDeck: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  copyBlock: {
    marginBottom: 28,
  },
  headline: {
    fontFamily: fonts.heading,
    fontSize: 32,
    fontWeight: '900',
    color: '#0A0A0A',
    lineHeight: 38,
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  narrative: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#71717A',
    lineHeight: 22,
    maxWidth: 320,
    letterSpacing: -0.1,
  },
  actionDeck: {
    gap: 8,
  },
  primaryCta: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCtaText: {
    fontFamily: fonts.bodyBold,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  secondaryLink: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryLinkText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: '#71717A',
    fontWeight: '500',
  },
  obsidianHighlight: {
    color: '#0A0A0A',
    fontWeight: '700',
  },
});
