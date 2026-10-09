/** Formats a database time such as 07:30:00 as a short local 12-hour time. */
export function formatTime(value: string) {
  const [hourText = '0', minute = '00'] = value.split(':')
  const hour = Number(hourText)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12}:${minute} ${suffix}`
}

/** Creates initials for the profile avatar. */
export function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'F'
}
