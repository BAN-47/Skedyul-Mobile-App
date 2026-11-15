import { Text, View } from 'react-native'
import { styles } from '../styles/facultyStyles'

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.brandRow, compact && styles.brandRowCompact]}>
      <Text style={[styles.logoLoading, compact && styles.logoLoadingSmall]}>
        SKED<Text style={styles.logoAccentLoading}>YUL</Text>
      </Text>
    </View>
  )
}
