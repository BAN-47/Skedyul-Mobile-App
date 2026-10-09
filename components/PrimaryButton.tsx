import { ActivityIndicator, Pressable, Text } from 'react-native'
import { COLORS, styles } from '../styles/facultyStyles'

export function PrimaryButton({ title, busy, onPress }: { title: string; busy: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={busy}
      style={({ pressed }) => [styles.primaryButton, busy && styles.disabledButton, pressed && !busy && styles.pressedButton]}
    >
      {busy ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.primaryButtonText}>{title}</Text>}
    </Pressable>
  )
}
