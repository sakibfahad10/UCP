/**
 * Converts a UTC ISO string from the database to a datetime-local input value.
 * The datetime-local input expects local time, so we convert UTC → local.
 */
export function utcToLocalDatetimeString(utcString: string | null): string {
  if (!utcString) return ""
  const date = new Date(utcString)
  // Get timezone offset in minutes and convert to local
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

/**
 * Converts a datetime-local input value (local time) to a UTC ISO string for the database.
 * The datetime-local input gives us local time, which new Date() interprets correctly,
 * then toISOString() converts to UTC.
 */
export function localDatetimeStringToUTC(localString: string): string | null {
  if (!localString) return null
  return new Date(localString).toISOString()
}
