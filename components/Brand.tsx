import { Text, View } from 'react-native'
import { styles } from '../styles/facultyStyles'

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.brandRow}>
      <View style={[styles.brandMark, compact && styles.brandMarkSmall]}>
        <Text style={[styles.brandMarkText, compact && styles.brandMarkTextSmall]}>S</Text>
      </View>
      <Text style={[styles.brandName, compact && styles.brandNameSmall]}>Skedyul</Text>
    </View>
  )
}
