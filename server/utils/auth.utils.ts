import { createHash } from 'crypto'

// Helper function to hash password with MD5
export const hashPassword = (password: string): string => {
  return createHash('md5').update(password).digest('hex')
}

// Helper function to generate tokens
export const generateToken = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

const normalizeInputDate = (value: string | Date) => {
  if (value instanceof Date) return value
  const trimmed = value.trim()
  if (trimmed.includes('T')) {
    const isoDate = new Date(trimmed)
    if (isNaN(isoDate.getTime())) {
      throw new Error('Invalid ISO date value')
    }
    return isoDate
  }
  // Treat plain SQL datetime string as-is
  return trimmed
}

export const formatFlightIdDatePart = (dateValue: string | Date): string => {
  if (typeof dateValue === 'string' && !dateValue.includes('T')) {
    const jsDate = new Date(`${dateValue.replace(' ', 'T')}Z`)
    return isNaN(jsDate.getTime()) ? dateValue : jsDate.toISOString()
  }
  const jsDate = normalizeInputDate(dateValue)
  return jsDate instanceof Date ? jsDate.toISOString() : jsDate
}

const formatDateLocal = (date: Date) => {
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export const formatDateTimeForSql = (dateValue: string | Date): string => {
  if (typeof dateValue === 'string' && !dateValue.includes('T')) {
    return dateValue
  }
  const jsDate = normalizeInputDate(dateValue)
  if (jsDate instanceof Date) {
    return formatDateLocal(jsDate)
  }
  return jsDate
}

export const buildFlightId = (airlineName: string, flightNumber: string, depDateTime: string | Date): string => {
  const datePart = formatDateTimeForSql(depDateTime)
  return `${airlineName}_${flightNumber}_${datePart}`
}

// Helper function to parse flightId (format: Airline_Name_Flight_number_<ISO datetime>)
export const parseFlightId = (flightId: string): { airlineName: string; flightNumber: string; depDateTime: string } => {
  // Decode URL encoding if present
  let decodedFlightId = decodeURIComponent(flightId);
  decodedFlightId = decodedFlightId.replace(/%20/g, ' ').replace(/\+/g, ' ');
  
  // Find the last underscore (separates flight number from datetime)
  const lastUnderscoreIndex = decodedFlightId.lastIndexOf('_');
  if (lastUnderscoreIndex === -1) {
    throw new Error('Invalid flight ID format - no underscore found');
  }
  
  // Everything after last underscore is the datetime (ISO or SQL)
  const depDatePart = decodedFlightId.substring(lastUnderscoreIndex + 1);
  const depDateTime = depDatePart.includes('T')
    ? formatDateTimeForSql(depDatePart)
    : depDatePart;
  
  // Find the second-to-last underscore (separates airline name from flight number)
  const beforeLastPart = decodedFlightId.substring(0, lastUnderscoreIndex);
  const secondLastUnderscoreIndex = beforeLastPart.lastIndexOf('_');
  
  if (secondLastUnderscoreIndex === -1) {
    throw new Error('Invalid flight ID format - not enough parts');
  }
  
  const airlineName = beforeLastPart.substring(0, secondLastUnderscoreIndex);
  const flightNumber = beforeLastPart.substring(secondLastUnderscoreIndex + 1);
  
  return { airlineName, flightNumber, depDateTime };
}

