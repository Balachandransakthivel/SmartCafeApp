import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isTabletOrDesktop = SCREEN_WIDTH >= 600;

// 3D Floating orbs for background decoration
function FloatingOrb({ size, color, top, left, delay }: {
  size: number;
  color: string;
  top: number;
  left: number;
  delay: number;
}) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(floatAnim, {
              toValue: -12,
              duration: 2400,
              useNativeDriver: true,
            }),
            Animated.timing(floatAnim, {
              toValue: 0,
              duration: 2400,
              useNativeDriver: true,
            }),
          ])
        ),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: opacityAnim,
        transform: [{ translateY: floatAnim }],
      }}
    />
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  // Entrance animations
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const heroScale = useRef(new Animated.Value(0.95)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const logoSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(heroScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(cardSlide, { toValue: 0, friction: 7, tension: 80, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();

    // Logo entrance spin
    Animated.sequence([
      Animated.delay(500),
      Animated.timing(logoSpin, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const logoRotate = logoSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '0deg'],
  });

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      router.replace('/(tabs)');
    } else {
      showAlert('Login Failed', result.message || 'Invalid credentials');
    }
  };

  const fillDemoCredentials = () => {
    setEmail('demo@smartcafe.com');
    setPassword('demo123');
  };

  const fillAdminCredentials = () => {
    setEmail('admin@smartcafe.com');
    setPassword('admin123');
  };

  const formContent = (
    <Animated.View
      style={[
        styles.card,
        isTabletOrDesktop && styles.cardDesktop,
        { opacity: cardOpacity, transform: [{ translateY: cardSlide }] },
      ]}
    >
      {/* 3D Logo Header */}
      <View style={styles.logoSection}>
        <Animated.View
          style={[
            styles.logoOrb,
            { transform: [{ rotate: logoRotate }] },
          ]}
        >
          {/* Inner 3D glow layers */}
          <View style={styles.orbInner1} />
          <View style={styles.orbInner2} />
          <MaterialIcons name="local-cafe" size={44} color="#fff" style={{ zIndex: 10 }} />
        </Animated.View>
        <Text style={styles.brandName}>Smart Café</Text>
        <Text style={styles.brandTagline}>☕ AI-Powered Food Ordering</Text>
        <View style={styles.demoBadge}>
          <View style={styles.demoDot} />
          <Text style={styles.demoBadgeText}>DEMO MODE ACTIVE</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.sectionDivider} />

      {/* Email Input */}
      <Text style={styles.fieldLabel}>Email Address</Text>
      <View
        style={[
          styles.inputContainer,
          focusedField === 'email' && styles.inputContainerFocused,
        ]}
      >
        <View style={[styles.inputIconBox, focusedField === 'email' && styles.inputIconBoxActive]}>
          <MaterialIcons
            name="email"
            size={18}
            color={focusedField === 'email' ? '#fff' : '#7A6050'}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor={Colors.mediumGray}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setFocusedField('email')}
          onBlur={() => setFocusedField(null)}
          accessibilityLabel="Email address"
        />
      </View>

      {/* Password Input */}
      <Text style={styles.fieldLabel}>Password</Text>
      <View
        style={[
          styles.inputContainer,
          focusedField === 'password' && styles.inputContainerFocused,
        ]}
      >
        <View style={[styles.inputIconBox, focusedField === 'password' && styles.inputIconBoxActive]}>
          <MaterialIcons
            name="lock"
            size={18}
            color={focusedField === 'password' ? '#fff' : '#7A6050'}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          placeholderTextColor={Colors.mediumGray}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          onFocus={() => setFocusedField('password')}
          onBlur={() => setFocusedField(null)}
          accessibilityLabel="Password"
        />
        <Pressable
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons
            name={showPassword ? 'visibility' : 'visibility-off'}
            size={20}
            color="#7A6050"
          />
        </Pressable>
      </View>

      {/* Login Button — 3D style */}
      <Pressable
        style={({ pressed }) => [
          styles.loginButton,
          pressed && styles.loginButtonPressed,
          loading && styles.loginButtonLoading,
        ]}
        onPress={handleLogin}
        disabled={loading}
        accessibilityLabel="Login"
      >
        <View style={styles.loginButtonGlow} />
        {loading ? (
          <View style={styles.loadingRow}>
            <MaterialIcons name="autorenew" size={22} color="#fff" />
            <Text style={styles.loginButtonText}>Signing In...</Text>
          </View>
        ) : (
          <View style={styles.loginButtonRow}>
            <MaterialIcons name="login" size={22} color="#fff" />
            <Text style={styles.loginButtonText}>Sign In</Text>
          </View>
        )}
      </Pressable>

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerLabel}>Quick Login</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Quick Login Buttons */}
      <View style={styles.quickRow}>
        <Pressable
          style={({ pressed }) => [styles.quickBtn, pressed && styles.quickBtnPressed]}
          onPress={fillDemoCredentials}
        >
          <View style={[styles.quickIcon, { backgroundColor: Colors.primary + '22' }]}>
            <MaterialIcons name="person" size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.quickBtnLabel}>Customer</Text>
            <Text style={styles.quickBtnSub}>demo@smartcafe.com</Text>
          </View>
          <MaterialIcons name="arrow-forward-ios" size={14} color="#7A6050" style={{ marginLeft: 'auto' }} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.quickBtn, pressed && styles.quickBtnPressed]}
          onPress={fillAdminCredentials}
        >
          <View style={[styles.quickIcon, { backgroundColor: Colors.coffeeBrown + '22' }]}>
            <MaterialIcons name="admin-panel-settings" size={20} color={Colors.coffeeBrown} />
          </View>
          <View>
            <Text style={styles.quickBtnLabel}>Admin</Text>
            <Text style={styles.quickBtnSub}>admin@smartcafe.com</Text>
          </View>
          <MaterialIcons name="arrow-forward-ios" size={14} color="#7A6050" style={{ marginLeft: 'auto' }} />
        </Pressable>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <MaterialIcons name="info-outline" size={16} color={Colors.primary} />
        <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
          <Text style={styles.infoRow}>
            <Text style={styles.infoBold}>Customer: </Text>demo@smartcafe.com / demo123
          </Text>
          <Text style={styles.infoRow}>
            <Text style={styles.infoBold}>Admin: </Text>admin@smartcafe.com / admin123
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.root}>
      {/* Gradient background */}
      <View style={styles.bgGradient} />
      <View style={styles.bgGradient2} />

      {/* Floating 3D orbs */}
      <FloatingOrb size={180} color="rgba(255,122,0,0.12)" top={-40} left={-60} delay={0} />
      <FloatingOrb size={120} color="rgba(111,78,55,0.10)" top={80} left={SCREEN_WIDTH - 100} delay={400} />
      <FloatingOrb size={90}  color="rgba(255,122,0,0.08)" top={SCREEN_HEIGHT * 0.4} left={-30} delay={200} />
      <FloatingOrb size={200} color="rgba(111,78,55,0.07)" top={SCREEN_HEIGHT * 0.6} left={SCREEN_WIDTH * 0.5} delay={600} />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              isTabletOrDesktop && styles.scrollContentDesktop,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Hero Image — 3D floating card effect */}
            <Animated.View
              style={[
                styles.heroWrapper,
                isTabletOrDesktop && styles.heroWrapperDesktop,
                { opacity: heroOpacity, transform: [{ scale: heroScale }] },
              ]}
            >
              <Image
                source={require('@/assets/images/login-hero-3d.png')}
                style={styles.heroImage}
                contentFit="cover"
                transition={300}
              />
              {/* 3D overlay shimmer */}
              <View style={styles.heroOverlay} />
              <View style={styles.heroBadge}>
                <MaterialIcons name="star" size={14} color="#FFD700" />
                <Text style={styles.heroBadgeText}>Premium Café Experience</Text>
              </View>
            </Animated.View>

            {/* Card */}
            {isTabletOrDesktop ? (
              <View style={styles.desktopLayout}>
                {formContent}
              </View>
            ) : (
              formContent
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    position: 'relative',
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.45,
    backgroundColor: '#6F4E37',
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
    opacity: 0.08,
  },
  bgGradient2: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: '#FF7A00',
    opacity: 0.04,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  scrollContentDesktop: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  heroWrapper: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
    borderRadius: 24,
    overflow: 'hidden',
    // 3D shadow stack
    shadowColor: '#6F4E37',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 18,
  },
  heroWrapperDesktop: {
    width: '100%',
    maxWidth: 680,
  },
  heroImage: {
    width: '100%',
    height: SCREEN_WIDTH >= 600 ? 280 : 210,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(111,78,55,0.15)',
  },
  heroBadge: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
  },
  desktopLayout: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: Spacing.xl,
    // Layered 3D shadow
    shadowColor: '#6F4E37',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 14,
    borderWidth: 1,
    borderColor: 'rgba(111,78,55,0.08)',
  },
  cardDesktop: {
    padding: Spacing.xxxl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoOrb: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    // 3D layered shadow
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 16,
    position: 'relative',
  },
  orbInner1: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  orbInner2: {
    position: 'absolute',
    top: 18,
    left: 14,
    width: 24,
    height: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    transform: [{ rotate: '-15deg' }],
  },
  brandName: {
    fontSize: 30,
    fontWeight: Typography.fontWeight.bold,
    color: '#2C1A0E',
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: Typography.fontSize.sm,
    color: '#7A6050',
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  demoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '15',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  demoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  demoBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.xl,
    opacity: 0.6,
  },
  fieldLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#2C1A0E',
    marginBottom: 8,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F2ED',
    borderRadius: 14,
    marginBottom: Spacing.lg,
    paddingRight: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    // Subtle inset shadow
    shadowColor: '#6F4E37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  inputContainerFocused: {
    borderColor: Colors.primary,
    backgroundColor: '#fff',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIconBox: {
    width: 44,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: 'transparent',
  },
  inputIconBoxActive: {
    backgroundColor: Colors.primary,
    marginLeft: 0,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: '#1A0F06',
  },
  eyeButton: {
    padding: Spacing.sm,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
    // 3D shadow
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  loginButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }, { translateY: 2 }],
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonLoading: {
    opacity: 0.7,
  },
  loginButtonGlow: {
    position: 'absolute',
    top: 0,
    left: '10%',
    right: '10%',
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 100,
  },
  loginButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loginButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#fff',
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerLabel: {
    marginHorizontal: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: '#7A6050',
    fontWeight: Typography.fontWeight.medium,
  },
  quickRow: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#F7F2ED',
    borderRadius: 14,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#6F4E37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  quickBtnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBtnLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#2C1A0E',
  },
  quickBtnSub: {
    fontSize: Typography.fontSize.xs,
    color: '#7A6050',
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primary + '0D',
    borderRadius: 12,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  infoRow: {
    fontSize: Typography.fontSize.xs,
    color: '#7A6050',
    lineHeight: 18,
  },
  infoBold: {
    fontWeight: Typography.fontWeight.semiBold,
    color: '#2C1A0E',
  },
});
