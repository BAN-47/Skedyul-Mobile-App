import { Text, View } from 'react-native'
import { styles } from '../styles/facultyStyles'

export function ErrorBanner({ message }: { message: string }) {
  return <View style={styles.errorBanner}><Text style={styles.errorText}>{message}</Text></View>
}
