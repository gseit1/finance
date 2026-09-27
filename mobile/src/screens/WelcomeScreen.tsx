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
      <StatusBar barStyle="light-content" />



      {/* Kinetic Visual Centerpiece: Dynamic 3D Perspective Card & Concentric Rings */}
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
              Already have an account? <Text style={styles.whiteHighlight}>Sign In</Text>
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
    backgroundColor: '#08080A',
    justifyContent: 'space-between',
  },
  topHeader: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  watermark: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 2,
    color: '#52525B',
    fontWeight: '700',
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
    fontSize: 34,
    fontWeight: '900',
    color: '#FAFAFA',
    lineHeight: 38,
    letterSpacing: -1,
    marginBottom: 10,
  },
  narrative: {
    fontSize: 13,
    color: '#A1A1AA',
    lineHeight: 20,
    maxWidth: 320,
    letterSpacing: -0.1,
  },
  actionDeck: {
    gap: 8,
  },
  primaryCta: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryCtaText: {
    color: '#08080A',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryLink: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryLinkText: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '500',
  },
  whiteHighlight: {
    color: '#FAFAFA',
    fontWeight: '700',
  },
});
