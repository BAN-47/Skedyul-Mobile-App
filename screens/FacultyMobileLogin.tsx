import { useRef, useState } from "react";
import type { ComponentRef } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { ErrorBanner } from "../components/ErrorBanner";
import { loginStyles as s } from "../styles/loginStyles";

export function FacultyMobileLogin({
  busy,
  error,
  onSignIn,
}: {
  busy: boolean;
  error: string;
  onSignIn: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<"email" | "password" | null>(null);
  const passwordInput = useRef<ComponentRef<typeof TextInput>>(null);

  const submit = () => void onSignIn(email, password);

  const openSignup = async () => {
    try {
      await Linking.openURL("http://localhost/Skedyul/public/register");
    } catch (error) {
      console.error("Could not open the SKEDYUL registration page.", error);
      Alert.alert(
        "Unable to open sign up",
        "Make sure the SKEDYUL website is running in XAMPP, then try again.",
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
              returnKeyType="next"
              onSubmitEditing={() => passwordInput.current?.focus()}
            />

            <Text style={[s.label, s.labelSpaced]}>
              Password <Text style={s.required}>*</Text>
            </Text>
            <View
              style={[
                s.passwordRow,
                focused === "password" && s.inputFocused,
              ]}
            >
              <TextInput
                ref={passwordInput}
                style={s.passwordInput}
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
