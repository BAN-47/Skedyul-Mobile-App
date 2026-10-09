import { useCallback, useEffect, useState } from 'react'
import { ApiError, clearSavedToken, getDashboard, getSavedToken, removeFacultyPhoto as apiRemoveFacultyPhoto, saveContactInfo, saveNotificationPreferences, savePersonalInfo, saveSecuritySettings, signIn as apiSignIn, signOut as apiSignOut, updatePassword, uploadFacultyPhoto as apiUploadFacultyPhoto, type FacultyDashboard } from '../lib/api'
import { getErrorMessage } from '../utils/errors'

/** Authentication, token restoration, dashboard loading, and refresh behavior. */
export function useFacultySession() {
  const [token, setToken] = useState<string | null>(null)
  const [dashboard, setDashboard] = useState<FacultyDashboard | null>(null)
  const [restoring, setRestoring] = useState(true)
  const [busy, setBusy] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async (accessToken: string) => {
    const result = await getDashboard(accessToken)
    setDashboard(result)
    setError('')
  }, [])

  useEffect(() => {
    let mounted = true
    async function restoreSession() {
      try {
        const savedToken = await getSavedToken()
        if (!savedToken) return
        if (mounted) setToken(savedToken)
        const result = await getDashboard(savedToken)
        if (mounted) setDashboard(result)
      } catch (cause) {
        if (cause instanceof ApiError && cause.status === 401) {
          await clearSavedToken()
          if (mounted) setToken(null)
        } else if (mounted) setError(getErrorMessage(cause))
      } finally {
        if (mounted) setRestoring(false)
      }
    }
    void restoreSession()
    return () => { mounted = false }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setBusy(true)
    setError('')
    try {
      const accessToken = await apiSignIn(email.trim(), password)
      setToken(accessToken)
      await loadDashboard(accessToken)
    } catch (cause) {
      setError(getErrorMessage(cause))
    } finally {
      setBusy(false)
    }
  }, [loadDashboard])

  const signOut = useCallback(async () => {
    setBusy(true)
    try {
      if (token) await apiSignOut(token)
    } catch {
      // Clear the local token even if the phone is offline.
    } finally {
      await clearSavedToken()
      setToken(null)
      setDashboard(null)
      setError('')
      setBusy(false)
    }
  }, [token])

  const refresh = useCallback(async () => {
    if (!token) return
    setRefreshing(true)
    try {
      await loadDashboard(token)
    } catch (cause) {
      setError(getErrorMessage(cause))
    } finally {
      setRefreshing(false)
    }
  }, [loadDashboard, token])

  const saveProfile = useCallback(async (personalInfo: Record<string, unknown>, contactInfo: Record<string, unknown>) => {
    if (!token) throw new Error('Sign in again to update your profile.')
    await savePersonalInfo(token, personalInfo)
    await saveContactInfo(token, contactInfo)
    await loadDashboard(token)
  }, [loadDashboard, token])

  const changePassword = useCallback(async (data: { current_password: string; new_password: string; new_password_confirmation: string }) => {
    if (!token) throw new Error('Sign in again to update your password.')
    await updatePassword(token, data)
  }, [token])

  const saveSecurity = useCallback(async (data: { usr_session_timeout_minutes: number; usr_max_login_attempts: number }) => {
    if (!token) throw new Error('Sign in again to update security settings.')
    await saveSecuritySettings(token, data)
    await loadDashboard(token)
  }, [loadDashboard, token])

  const saveNotifications = useCallback(async (data: Record<string, boolean>) => {
    if (!token) throw new Error('Sign in again to update notification settings.')
    await saveNotificationPreferences(token, data)
    await loadDashboard(token)
  }, [loadDashboard, token])

  const uploadFacultyPhoto = useCallback(async (uri: string, fileName: string, mimeType: string) => {
    if (!token) throw new Error('Sign in again to update your profile photo.')
    await apiUploadFacultyPhoto(token, uri, fileName, mimeType)
    await loadDashboard(token)
  }, [loadDashboard, token])

  const removeFacultyPhoto = useCallback(async () => {
    if (!token) throw new Error('Sign in again to update your profile photo.')
    await apiRemoveFacultyPhoto(token)
    await loadDashboard(token)
  }, [loadDashboard, token])

  return { token, dashboard, restoring, busy, refreshing, error, signIn, signOut, refresh, saveProfile, changePassword, saveSecurity, saveNotifications, uploadFacultyPhoto, removeFacultyPhoto }
}
