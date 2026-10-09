/** Turns API and JavaScript errors into text that can be shown in the app. */
export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}
