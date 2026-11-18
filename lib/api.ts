import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import * as LocalAuthentication from 'expo-local-authentication'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

const TOKEN_KEY = 'skedyul-faculty-api-token'
const BIOMETRIC_TOKEN_KEY = 'skedyul-faculty-biometric-token'
const BIOMETRIC_ENABLED_KEY = 'skedyul-faculty-biometric-enabled'
const BIOMETRIC_TOKEN_OPTIONS = {
  requireAuthentication: true,
  authenticationPrompt: 'Verify to unlock your SKEDYUL sign-in',
}

const storage = {
  getItem: async (key: string) => Platform.OS === 'web' ? await AsyncStorage.getItem(key) : await SecureStore.getItemAsync(key),
  setItem: async (key: string, value: string) => Platform.OS === 'web' ? await AsyncStorage.setItem(key, value) : await SecureStore.setItemAsync(key, value),
  removeItem: async (key: string) => Platform.OS === 'web' ? await AsyncStorage.removeItem(key) : await SecureStore.deleteItemAsync(key),
}

/** Use an explicit server URL for deployed builds, or the Expo host on local development. */
function apiBaseUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '')
  if (configuredUrl) {
    if (!__DEV__) {
      let parsedUrl: URL
      try {
        parsedUrl = new URL(configuredUrl)
      } catch {
        throw new Error('Set EXPO_PUBLIC_API_URL to your deployed Skedyul API URL.')
      }
      if (parsedUrl.protocol !== 'https:') {
        throw new Error('The deployed Skedyul API must use HTTPS. Set EXPO_PUBLIC_API_URL to its HTTPS address.')
      }
    }
    return configuredUrl
  }

  if (__DEV__) {
    const expoHost = Constants.expoConfig?.hostUri?.split(':')[0]
    if (expoHost) return `http://${expoHost}:8000`
  }

  if (typeof window !== 'undefined' && window.location.hostname) {
    return __DEV__ ? `http://${window.location.hostname}:8000` : window.location.origin
  }

  return null
}

export function facultySignupUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_SIGNUP_URL?.trim()
  if (configuredUrl) return configuredUrl
  const baseUrl = apiBaseUrl()
  if (!baseUrl) return null
  return new URL('register', `${baseUrl.replace(/\/+$/, '')}/`).toString()
}

export type FacultySchedule = {
  id: string
  course_code: string | null
  course_name: string | null
  section: string | null
  section_id?: string | null
  room: string | null
  day: string
  shift?: 'day' | 'evening' | null
  start_time: string
  end_time: string
  units?: number | string | null
  student_count?: number | string | null
  lecture_hours?: number | string | null
  lab_hours?: number | string | null
}

export type ScheduleShiftFilter = 'all' | 'day' | 'evening'

export type FacultyProfile = {
  name: string
  first_name: string
  last_name?: string
  middle_name?: string | null
  suffix?: string | null
  employee_id: string | null
  gender?: string | null
  civil_status?: string | null
  date_of_birth?: string | null
  nationality?: string | null
  rank?: string | null
  phone_number?: string | null
  address?: string | null
  bio?: string | null
  bachelors_degree?: string | null
  masters_degree?: string | null
  doctorate_degree?: string | null
  bachelors_abbr?: string | null
  masters_abbr?: string | null
  doctorate_abbr?: string | null
  email?: string | null
  profile_image?: string | null
  program: string | null
  college: string | null
}

export type FacultyDashboard = {
  faculty: FacultyProfile
  semester: { name: string; academic_year: string | null } | null
  load: {
    hours: number
    max_hours: number
    preparations?: number
    units?: number
    hours_per_week?: number
    designation?: string | null
    production?: string | null
    extension?: string | null
    research?: string | null
    shift_breakdown?: {
      total_preparations: number
      day: { preparations: number; units: number; hours_per_week: number; max_hours: number }
      evening: { preparations: number; units: number; hours_per_week: number; max_hours: number }
    }
  }
  settings?: {
    session_timeout_minutes: number
    max_login_attempts: number
    notifications: {
      schedule_updates: boolean
      new_assignments: boolean
      reminders: boolean
      system_announcements: boolean
    }
  }
  today: string
  subject_count: number
  schedules: FacultySchedule[]
}

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

function apiUrl(path: string) {
  const baseUrl = apiBaseUrl()
  if (!baseUrl) {
    throw new Error(__DEV__
      ? 'Could not find the Skedyul server address. Start Expo on the same Wi-Fi as Laravel, or set EXPO_PUBLIC_API_URL.'
      : 'The Skedyul server address is not configured. Set EXPO_PUBLIC_API_URL to your deployed HTTPS server address.')
  }
  return `${baseUrl}/api${path}`
}

/** Repair local Laravel asset URLs (`localhost`/loopback) for a phone on the same LAN. */
export function facultyImageUrl(value?: string | null) {
  if (!value) return null
  try {
    const image = new URL(value)
    const baseUrl = apiBaseUrl()
    if (!baseUrl) return value
    const apiOrigin = new URL(baseUrl)
    if (['localhost', '127.0.0.1', '::1'].includes(image.hostname)) {
      image.host = apiOrigin.host
      image.protocol = apiOrigin.protocol
    }
    return image.toString()
  } catch {
    return value
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ApiError(body?.message || 'The Skedyul server could not complete the request.', response.status)
  }
  return body as T
}

async function authorizedRequest<T>(token: string, path: string, data: unknown) {
  const response = await fetch(apiUrl(path), {
    method: 'PUT',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  })
  return parseResponse<T>(response)
}

export async function getBiometricSignInEnabled() {
  if (Platform.OS === 'web') return false
  return (await storage.getItem(BIOMETRIC_ENABLED_KEY)) === 'true'
}

export async function setBiometricSignIn(token: string, enabled: boolean) {
  if (Platform.OS === 'web') throw new Error('Biometric sign-in is available in the mobile app only.')

  if (enabled) {
    if (!(await LocalAuthentication.hasHardwareAsync())) {
      throw new Error('This device does not have a supported fingerprint or face sensor.')
    }
    if (!(await LocalAuthentication.isEnrolledAsync())) {
      throw new Error('Set up fingerprint or face unlock in your device settings first.')
    }
    if (!SecureStore.canUseBiometricAuthentication()) {
      throw new Error('This device cannot securely protect biometric sign-in.')
    }

    if (Platform.OS === 'ios') {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable biometric sign-in for SKEDYUL',
        disableDeviceFallback: false,
      })
      if (!result.success) throw new Error('Biometric setup was cancelled. Try again when you are ready.')
    }

    await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, token, BIOMETRIC_TOKEN_OPTIONS)
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true')
    await SecureStore.deleteItemAsync(TOKEN_KEY)
    return
  }

  await SecureStore.setItemAsync(TOKEN_KEY, token)
  await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'false')
  try {
    await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY, BIOMETRIC_TOKEN_OPTIONS)
  } catch {
  }
}

export async function signIn(email: string, password: string) {
  const response = await fetch(apiUrl('/mobile/faculty/login'), {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, device_name: 'Skedyul Faculty Mobile' }),
  })
  const result = await parseResponse<{ token: string }>(response)
  await storage.setItem(BIOMETRIC_ENABLED_KEY, 'false')
  await storage.setItem(TOKEN_KEY, result.token)
  return result.token
}

export async function getDashboard(token: string): Promise<FacultyDashboard> {
  const response = await fetch(apiUrl('/mobile/faculty/dashboard'), {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  })
  return parseResponse<FacultyDashboard>(response)
}

export function savePersonalInfo(token: string, data: Record<string, unknown>) {
  return authorizedRequest<{ message: string }>(token, '/mobile/faculty/settings/personal-info', data)
}

export function saveContactInfo(token: string, data: Record<string, unknown>) {
  return authorizedRequest<{ message: string }>(token, '/mobile/faculty/settings/contact', data)
}

export function updatePassword(token: string, data: { current_password: string; new_password: string; new_password_confirmation: string }) {
  return authorizedRequest<{ message: string }>(token, '/mobile/faculty/settings/password', data)
}

export function saveSecuritySettings(token: string, data: { usr_session_timeout_minutes: number; usr_max_login_attempts: number }) {
  return authorizedRequest<{ message: string }>(token, '/mobile/faculty/settings/security', data)
}

export function saveNotificationPreferences(token: string, data: Record<string, boolean>) {
  return authorizedRequest<{ message: string }>(token, '/mobile/faculty/settings/notifications', data)
}

export async function uploadFacultyPhoto(token: string, uri: string, fileName: string, mimeType: string) {
  const data = new FormData()
  data.append('avatar', { uri, name: fileName, type: mimeType } as unknown as Blob)
  const response = await fetch(apiUrl('/mobile/faculty/profile/avatar'), {
    method: 'POST',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    body: data,
  })
  return parseResponse<{ message: string; profile_image: string }>(response)
}

export async function removeFacultyPhoto(token: string) {
  const response = await fetch(apiUrl('/mobile/faculty/profile/avatar'), {
    method: 'DELETE',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  })
  return parseResponse<{ message: string; profile_image: null }>(response)
}

export async function signOut(token: string) {
  try {
    const response = await fetch(apiUrl('/mobile/faculty/logout'), {
      method: 'POST',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
    await parseResponse<{ message: string }>(response)
  } finally {
    await clearSavedToken()
  }
}

export async function getSavedToken() {
  if (await getBiometricSignInEnabled()) {
    return SecureStore.getItemAsync(BIOMETRIC_TOKEN_KEY, BIOMETRIC_TOKEN_OPTIONS)
  }
  return storage.getItem(TOKEN_KEY)
}

export async function clearSavedToken() {
  await storage.setItem(BIOMETRIC_ENABLED_KEY, 'false')
  await storage.removeItem(TOKEN_KEY)
}
