import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '../services/authService';
import { fonts } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';
import { KineticSpinner } from '../components/KineticSpinner';
import { KineticPressable } from '../components/KineticPressable';
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  CheckboxIcon,
  ArrowLeftIcon,
} from '../components/VectorIcons';

interface AuthScreenProps {
  initialMode?: 'signin' | 'signup';
  onAuthenticated: () => void;
  onBackToWelcome: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'signin',
  onAuthenticated,
  onBackToWelcome,
}) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Παρακαλώ συμπληρώστε το email και τον κωδικό πρόσβασης.');
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setErrorMessage('Οι κωδικοί πρόσβασης δεν ταιριάζουν.');
        return;
      }
      if (!agreeTerms) {
        setErrorMessage('Πρέπει να συμφωνήσετε με τους Όρους & Προϋποθέσεις.');
        return;
      }
    }

    setLoading(true);
    setErrorMessage('');

    try {
      if (mode === 'signin') {
        const result = await authService.signIn(email, password);
        if (!result.success) {
          setErrorMessage(result.error || 'Η σύνδεση απέτυχε. Ελέγξτε τα στοιχεία σας.');
          setLoading(false);
          return;
        }
      } else {
        const result = await authService.signUp(email, password);
        if (!result.success) {
          setErrorMessage(result.error || 'Η εγγραφή απέτυχε.');
          setLoading(false);
          return;
        }
      }

      // Smooth transition to app flow
      setTimeout(() => {
        setLoading(false);
        onAuthenticated();
      }, 400);
    } catch (err: any) {
      setErrorMessage(err.message || 'Σφάλμα ταυτοποίησης.');
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Επαναφορά Κωδικού',
      'Στείλαμε οδηγίες επαναφοράς στο email σας εφόσον υπάρχει καταχωρημένος λογαριασμός.',
      [{ text: 'Εντάξει' }]
    );
  };

  const isSignUp = mode === 'signup';

  return (
    <View style={[styles.container, { backgroundColor: '#F8F8F6' }]}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top + 12, 36),
              paddingBottom: Math.max(insets.bottom + 20, 36),
            },
          ]}
        >
          {/* Top Bar: Circular Back Button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={onBackToWelcome}
              style={styles.circularBackButton}
              activeOpacity={0.75}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ArrowLeftIcon size={18} color="#18181B" />
            </TouchableOpacity>
          </View>

          {/* Screen Title & Subtitle (Mockup screens 2 & 3) */}
          <View style={styles.titleSection}>
            <Text style={styles.titleText}>
              {isSignUp ? 'Δημιουργία λογαριασμού' : 'Σύνδεση λογαριασμού'}
            </Text>
            <Text style={styles.subtitleText}>
              {isSignUp ? 'Κάντε εγγραφή για να συνεχίσετε' : 'Καλώς ήρθατε ξανά!'}
            </Text>
          </View>

          {/* Error Banner */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Form Fields Container */}
          <View style={styles.formContainer}>
            {/* Field: Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputBox}>
                <View style={styles.inputLeadingIcon}>
                  <MailIcon size={18} color="#71717A" />
                </View>
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="example@gmail.com"
                  placeholderTextColor="#A1A1AA"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Field: Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Κωδικός πρόσβασης</Text>
              <View style={styles.inputBox}>
                <View style={styles.inputLeadingIcon}>
                  <LockIcon size={18} color="#71717A" />
                </View>
                <TextInput
                  style={styles.textInput}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder={isSignUp ? 'Δημιουργήστε κωδικό' : 'Εισάγετε τον κωδικό σας'}
                  placeholderTextColor="#A1A1AA"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeToggleBtn}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeIcon size={18} color="#71717A" />
                  ) : (
                    <EyeOffIcon size={18} color="#71717A" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Field: Confirm Password (Only for Sign Up) */}
            {isSignUp ? (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Επιβεβαίωση κωδικού</Text>
                <View style={styles.inputBox}>
                  <View style={styles.inputLeadingIcon}>
                    <LockIcon size={18} color="#71717A" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    value={confirmPassword}
                    onChangeText={(val) => {
                      setConfirmPassword(val);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Επανεισάγετε τον κωδικό"
                    placeholderTextColor="#A1A1AA"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeToggleBtn}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {showConfirmPassword ? (
                      <EyeIcon size={18} color="#71717A" />
                    ) : (
                      <EyeOffIcon size={18} color="#71717A" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {/* Checkbox Rows (Mockup screens 2 & 3) */}
            {isSignUp ? (
              // Sign Up: Terms & Conditions Checkbox
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAgreeTerms(!agreeTerms)}
                activeOpacity={0.8}
              >
                <CheckboxIcon checked={agreeTerms} color={theme.brandPink} size={19} />
                <Text style={styles.checkboxLabelText}>
                  Συμφωνώ με τους <Text style={styles.boldUnderline}>Όρους & Προϋποθέσεις</Text>
                </Text>
              </TouchableOpacity>
            ) : (
              // Sign In: Keep me logged in & Forgot password row
              <View style={styles.rememberForgotRow}>
                <TouchableOpacity
                  style={styles.checkboxRowInline}
                  onPress={() => setKeepLoggedIn(!keepLoggedIn)}
                  activeOpacity={0.8}
                >
                  <CheckboxIcon checked={keepLoggedIn} color={theme.brandPink} size={18} />
                  <Text style={styles.checkboxLabelText}>Να παραμείνω συνδεδεμένος</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleForgotPassword}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.forgotPasswordText}>Ξεχάσατε τον κωδικό;</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Primary Action Button */}
            <KineticPressable
              style={[styles.primaryButton, { backgroundColor: theme.brandPink }]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <KineticSpinner size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isSignUp ? 'Δημιουργία λογαριασμού' : 'Σύνδεση'}
                </Text>
              )}
            </KineticPressable>
          </View>

          {/* Bottom Switch Link: Already have an account / Don't have an account */}
          <View style={styles.bottomSwitchBlock}>
            {isSignUp ? (
              <TouchableOpacity
                style={styles.switchLink}
                onPress={() => {
                  setMode('signin');
                  setErrorMessage('');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.switchLinkText}>
                  Έχετε ήδη λογαριασμό; <Text style={styles.switchHighlight}>Σύνδεση</Text>
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.switchLink}
                onPress={() => {
                  setMode('signup');
                  setErrorMessage('');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.switchLinkText}>
                  Δεν έχετε λογαριασμό; <Text style={styles.switchHighlight}>Εγγραφή</Text>
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  topBar: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  circularBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  titleSection: {
    marginBottom: 24,
  },
  titleText: {
    fontFamily: fonts.heading,
    fontSize: 30,
    fontWeight: '900',
    color: '#18181B',
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  subtitleText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: '#71717A',
    letterSpacing: -0.2,
  },
  errorBanner: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorBannerText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: '#E11D48',
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13.5,
    color: '#3F3F46',
    fontWeight: '700',
  },
  inputBox: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E4E4E7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  inputLeadingIcon: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14.5,
    color: '#18181B',
    paddingVertical: 0,
  },
  eyeToggleBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 6,
  },
  checkboxRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rememberForgotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 8,
  },
  checkboxLabelText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#52525B',
  },
  boldUnderline: {
    fontFamily: fonts.bodyBold,
    fontWeight: '700',
    color: '#18181B',
  },
  forgotPasswordText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: '#71717A',
    fontWeight: '600',
  },
  primaryButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#E11D74',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  bottomSwitchBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 32,
  },
  switchLink: {
    paddingVertical: 10,
  },
  switchLinkText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#71717A',
  },
  switchHighlight: {
    fontFamily: fonts.bodyBold,
    color: '#18181B',
    fontWeight: '800',
  },
});
