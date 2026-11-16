import { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  type TextInputInstance,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { ErrorBanner } from "../components/ErrorBanner";
import { loginStyles as s } from "../styles/loginStyles";
import { facultySignupUrl } from "../lib/api";

export function FacultyMobileLogin({
  busy,
  error,
  biometricEnabled = false,
  onSignIn,
  onBiometricSignIn,
}: {
  busy: boolean;
  error: string;
  biometricEnabled?: boolean;
  onSignIn: (email: string, password: string) => Promise<void>;
  onBiometricSignIn?: () => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<"email" | "password" | null>(null);
  const emailInput = useRef<TextInputInstance>(null);
  const passwordInput = useRef<TextInputInstance>(null);

  const submit = () => void onSignIn(email, password);

  const openSignup = async () => {
    try {
      const signupUrl = facultySignupUrl();
      if (!signupUrl) {
        throw new Error("Set EXPO_PUBLIC_SIGNUP_URL or EXPO_PUBLIC_API_URL to your Skedyul server address.");
      }
      await Linking.openURL(signupUrl);
    } catch (error) {
      console.error("Could not open the SKEDYUL registration page.", error);
      Alert.alert(
        "Unable to open sign up",
        error instanceof Error ? error.message : "Check your Skedyul server address and try again.",
      );
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          {/* Branding (web left panel) */}
          <View style={s.hero}>
            <View style={[s.circle, s.circleTop]} />
            <View style={[s.circle, s.circleBottom]} />
            <Text style={s.logo}>
              SKED<Text style={s.logoAccent}>YUL</Text>
            </Text>
            <Text style={s.tagline}>FACULTY SCHEDULING SYSTEM</Text>
            <View style={s.badge}>
              <Text style={s.badgeTitle}>
                College of Computing, Information and Communications Technology
              </Text>
              <Text style={s.badgeSub}>
                Cebu Technological University · Main Campus
              </Text>
            </View>
          </View>

          {/* Form (web right panel) */}
          <View style={s.form}>
            <Text style={s.loginTitle}>
              LOG<Text style={s.loginTitleAccent}>IN</Text>
            </Text>
            <Text style={s.subtitle}>
              Sign in to your SKEDYUL account to continue.
            </Text>
            <Text style={s.label}>
              Email Address <Text style={s.required}>*</Text>
            </Text>
            <TextInput
              ref={emailInput}
              style={[s.input, focused === "email" && s.inputFocused]}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocused("email")}
              onBlur={() =>
                setFocused((current) => (current === "email" ? null : current))
              }
              placeholder="Enter your email address"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoComplete="off"
              importantForAutofill="no"
              keyboardType="email-address"
              editable={!busy}
              onSubmitEditing={() => passwordInput.current?.focus()}
              blurOnSubmit={false}
              returnKeyType="next"
            />

            <Text style={[s.label, s.labelSpaced]}>
              Password <Text style={s.required}>*</Text>
            </Text>
            <View style={s.passwordRow}>
              <TextInput
                ref={passwordInput}
                style={[
                  s.passwordInput,
                  focused === "password" && s.passwordInputFocused,
                ]}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocused("password")}
                onBlur={() =>
                  setFocused((current) =>
                    current === "password" ? null : current,
                  )
                }
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                autoComplete="off"
                importantForAutofill="no"
                secureTextEntry={!showPassword}
                editable={!busy}
                onSubmitEditing={submit}
                returnKeyType="go"
              />
              <Pressable
                onPress={() => setShowPassword((visible) => !visible)}
                style={s.eyeButton}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#94A3B8"
                />
              </Pressable>
            </View>

            {error ? <ErrorBanner message={error} /> : null}

            <Pressable
              onPress={submit}
              disabled={busy}
              accessibilityRole="button"
              style={({ pressed }) => [
                s.button,
                pressed && s.buttonPressed,
                busy && s.buttonDisabled,
              ]}
            >
              <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
              <Text style={s.buttonText}>
                {busy ? "Signing in…" : "Sign In"}
              </Text>
            </Pressable>

            {biometricEnabled && onBiometricSignIn ? (
              <Pressable
                onPress={() => void onBiometricSignIn()}
                disabled={busy}
                accessibilityRole="button"
                style={({ pressed }) => [
                  s.biometricButton,
                  pressed && !busy && s.buttonPressed,
                  busy && s.buttonDisabled,
                ]}
              >
                <Ionicons name="finger-print-outline" size={20} color="#2563EB" />
                <Text style={s.biometricButtonText}>Sign in with biometrics</Text>
              </Pressable>
            ) : null}

            <Text style={s.note}>
              Don't have an account?{" "}
              <Text
                style={s.signup}
                onPress={openSignup}
                accessibilityRole="link"
                accessibilityLabel="Sign up on the SKEDYUL website"
              >
                Click here
              </Text>{" "}
              to register right now!
            </Text>

            <Text style={s.developedBy}>2026™ SKEDYUL Team</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
