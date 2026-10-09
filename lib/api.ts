import * as SecureStore from 'expo-secure-store'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '')
const TOKEN_KEY = 'skedyul-faculty-api-token'

export type FacultySchedule = {
  id: string
  course_code: string | null
  course_name: string | null
  section: string | null
  room: string | null
  day: string
  start_time: string
  end_time: string
  units?: number | null
  student_count?: number | null
  lecture_hours?: number | null
  lab_hours?: number | null
}

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
  if (!API_BASE_URL) {
    throw new Error('Set EXPO_PUBLIC_API_URL to your reachable Skedyul server address.')
  }
  return `${API_BASE_URL}/api${path}`
}

/** Repair local Laravel asset URLs (`localhost`/loopback) for a phone on the same LAN. */
export function facultyImageUrl(value?: string | null) {
  if (!value) return null
  try {
    const image = new URL(value)
    const apiOrigin = new URL(API_BASE_URL || '')
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

export async function signIn(email: string, password: string) {
  const response = await fetch(apiUrl('/mobile/faculty/login'), {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, device_name: 'Skedyul Faculty Mobile' }),
  })
  const result = await parseResponse<{ token: string }>(response)
  await SecureStore.setItemAsync(TOKEN_KEY, result.token)
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
    await SecureStore.deleteItemAsync(TOKEN_KEY)
  }
}

export function getSavedToken() {
  return SecureStore.getItemAsync(TOKEN_KEY)
}

export function clearSavedToken() {
  return SecureStore.deleteItemAsync(TOKEN_KEY)
}
