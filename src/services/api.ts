// API service layer - fetches from backend server

const API_BASE_URL = 'http://localhost:3000/api'

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    // Include credentials so sessions/cookies are sent for server-side session auth
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    // Try to parse JSON error body if present, otherwise use statusText
    const contentType = response.headers.get('content-type') || ''
    let errorBody: any = { error: response.statusText || 'Request failed' }
    if (contentType.includes('application/json')) {
      errorBody = await response.json().catch(() => errorBody)
    }
    throw new Error(errorBody.error || errorBody.message || response.statusText || 'Request failed')
  }

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }
  // If not JSON, return text
  return response.text()
}

// Auth APIs
export async function loginUser(username: string, password: string) {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

// Registration APIs
export async function registerCustomer(data: any) {
  return apiCall('/auth/register/customer', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function registerStaff(data: any) {
  return apiCall('/auth/register/staff', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Flight search
export async function searchFlights(params: any) {
  const queryParams = new URLSearchParams({
    fromCity: params.fromCity || '',
    toCity: params.toCity || '',
    departureDate: params.departureDate || '',
    returnDate: params.returnDate || '',
    page: params.page?.toString() || '1',
    pageSize: params.pageSize?.toString() || '5',
  })

  return apiCall(`/flights?${queryParams}`)
}

// --------------------------------------------------
// CUSTOMER TICKETS - UPDATED TO MATCH BACKEND
// --------------------------------------------------

/**
 * Get customer tickets - matches your backend controller
 * Backend expects: GET /api/tickets/:email?dateFrom=...&dateTo=...
 */
export async function getCustomerTickets(
  email: string, 
  filters?: { dateFrom?: string; dateTo?: string }
) {
  const queryParams = new URLSearchParams()
  if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo)

  const query = queryParams.toString()
  // Changed endpoint to match your backend route: /api/tickets/:email
  return apiCall(`/tickets/${encodeURIComponent(email)}${query ? `?${query}` : ''}`)
}

/**
 * Purchase ticket - matches your backend controller
 * Backend expects: POST /api/tickets/purchase
 * Body: { airlineName, flightNumber, depDateTime, cardType }
 * Header: x-user-email
 */
export async function purchaseTicket(
  ticketData: {
    airlineName: string;
    flightNumber: string;
    depDateTime: string; // Format: YYYY-MM-DD HH:MM:SS
    cardType?: string; // Optional, defaults to "Credit" on backend
  },
  userEmail: string
) {
  return apiCall('/tickets/purchase', {
    method: 'POST',
    headers: {
      'x-user-email': userEmail,
    },
    body: JSON.stringify(ticketData),
  })
}

// Submit rating
export async function submitRating(flightId: string, rating: number, comment: string, customerEmail: string) {
  return apiCall('/ratings', {
    method: 'POST',
    body: JSON.stringify({ flightId, rating, comment, customerEmail }),
  })
}

// Staff APIs
export async function getStaffFlights(username: string, filters?: { dateFrom?: string; dateTo?: string; source?: string; destination?: string }) {
  const queryParams = new URLSearchParams()
  if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo)
  if (filters?.source) queryParams.append('source', filters.source)
  if (filters?.destination) queryParams.append('destination', filters.destination)

  const query = queryParams.toString()
  return apiCall(`/staff/${username}/flights${query ? `?${query}` : ''}`)
}

export async function createFlight(username: string, flightData: any) {
  return apiCall(`/staff/${username}/flights`, {
    method: 'POST',
    body: JSON.stringify(flightData),
  })
}

export async function changeFlightStatus(username: string, flightId: string, status: string) {
  return apiCall(`/staff/${username}/flights/${flightId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function getFlightPassengers(username: string, flightId: string) {
  return apiCall(`/staff/${username}/flights/${flightId}/passengers`)
}

export async function addAirplane(username: string, airplaneData: any) {
  return apiCall(`/staff/${username}/airplanes`, {
    method: 'POST',
    body: JSON.stringify(airplaneData),
  })
}

export async function getAirplanes(username: string) {
  return apiCall(`/staff/${username}/airplanes`)
}

// Get flight ratings
export async function getFlightRatings(flightId: string) {
  return apiCall(`/flights/${flightId}/ratings`)
}

// Get sales reports
export async function getSalesReports(filters?: { from?: string; to?: string }) {
  const queryParams = new URLSearchParams()
  if (filters?.from) queryParams.append('from', filters.from)
  if (filters?.to) queryParams.append('to', filters.to)

  const query = queryParams.toString()
  return apiCall(`/reports/sales${query ? `?${query}` : ''}`)
}

// --------------------------------------------------
// TYPE DEFINITIONS
// --------------------------------------------------

export interface Ticket {
  Ticket_ID: number;
  Customer_Email: string;
  Purchase_date_time: string;
  Card_type: string;
  Airline_Name: string;
  Flight_number: string;
  Dep_date_time: string;
  Arr_date_time: string;
  Dep_Airport_Code: string;
  Arr_Airport_Code: string;
  Base_price: number;
  Flight_Status: string;
}