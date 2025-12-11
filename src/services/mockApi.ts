// API service layer - fetches from backend server

const API_BASE_URL = 'http://localhost:3000/api'

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // Include cookies for session management
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }

  return response.json()
}

// Auth APIs
export async function loginUser(username: string, password: string) {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export async function logoutUser() {
  return apiCall('/auth/logout', {
    method: 'POST',
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

// Get customer tickets
export async function getCustomerTickets(filters?: { dateFrom?: string; dateTo?: string }) {
  const queryParams = new URLSearchParams()
  if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo)

  const query = queryParams.toString()
  return apiCall(`/customers/tickets${query ? `?${query}` : ''}`)
}

// Purchase ticket
export async function purchaseTicket(flightId: string, payment: any) {
  return apiCall('/tickets/purchase', {
    method: 'POST',
    body: JSON.stringify({ flightId, payment }),
  })
}

// Submit rating
export async function submitRating(flightId: string, rating: number, comment: string) {
  return apiCall('/ratings', {
    method: 'POST',
    body: JSON.stringify({ flightId, rating, comment }),
  })
}

export async function getCustomerRatings() {
  return apiCall('/ratings/customer')
}

// Staff APIs
export async function getStaffFlights(filters?: { dateFrom?: string; dateTo?: string; source?: string; destination?: string }) {
  const queryParams = new URLSearchParams()
  if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo)
  if (filters?.source) queryParams.append('source', filters.source)
  if (filters?.destination) queryParams.append('destination', filters.destination)

  const query = queryParams.toString()
  return apiCall(`/staff/flights${query ? `?${query}` : ''}`)
}

export async function createFlight(flightData: any) {
  return apiCall(`/staff/flights`, {
    method: 'POST',
    body: JSON.stringify(flightData),
  })
}

export async function changeFlightStatus(flightId: string, status: string) {
  return apiCall(`/staff/flights/${flightId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function getFlightPassengers(flightId: string) {
  return apiCall(`/staff/flights/${flightId}/passengers`)
}

export async function addAirplane(airplaneData: any) {
  return apiCall(`/staff/airplanes`, {
    method: 'POST',
    body: JSON.stringify(airplaneData),
  })
}

export async function getAirplanes() {
  return apiCall(`/staff/airplanes`)
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
