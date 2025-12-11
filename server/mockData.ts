// Mock data store - will be replaced with database later
import { createHash } from 'crypto'

// Helper to hash password with MD5
const hashPassword = (password: string): string => {
  return createHash('md5').update(password).digest('hex')
}

export const mockData = {
  customers: [
    {
      email: 'john@email.com',
      password: hashPassword('password123'), // MD5 hash
      fullName: 'John Doe',
      role: 'customer',
      token: 'cust_token_123',
    },
  ],
  staff: [
    {
      username: 'jetblue_staff',
      password: hashPassword('password123'), // MD5 hash
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'staff',
      airlineName: 'JetBlue',
      token: 'staff_token_123',
    },
  ],
  flights: [
    {
      id: 'F001',
      airline: 'JetBlue',
      flightNumber: 'B6101',
      depAirport: 'JFK',
      arrAirport: 'PVG',
      depDatetime: new Date(Date.now() + 86400000).toISOString(),
      arrDatetime: new Date(Date.now() + 86400000 + 32400000).toISOString(),
      basePrice: 850,
      status: 'on-time',
      seatsAvailable: 45,
      airplaneId: 'A001',
    },
    {
      id: 'F002',
      airline: 'JetBlue',
      flightNumber: 'B6102',
      depAirport: 'LAX',
      arrAirport: 'JFK',
      depDatetime: new Date(Date.now() + 172800000).toISOString(),
      arrDatetime: new Date(Date.now() + 172800000 + 18000000).toISOString(),
      basePrice: 450,
      status: 'on-time',
      seatsAvailable: 120,
      airplaneId: 'A002',
    },
    {
      id: 'F003',
      airline: 'JetBlue',
      flightNumber: 'B6103',
      depAirport: 'JFK',
      arrAirport: 'LAX',
      depDatetime: new Date(Date.now() + 259200000).toISOString(),
      arrDatetime: new Date(Date.now() + 259200000 + 18000000).toISOString(),
      basePrice: 420,
      status: 'on-time',
      seatsAvailable: 95,
      airplaneId: 'A001',
    },
  ],
  tickets: [
    {
      id: 'T001',
      flightId: 'F001',
      customerEmail: 'john@email.com',
      airline: 'JetBlue',
      flightNumber: 'B6101',
      depAirport: 'JFK',
      arrAirport: 'PVG',
      depDatetime: new Date(Date.now() + 86400000).toISOString(),
      arrDatetime: new Date(Date.now() + 86400000 + 32400000).toISOString(),
      seatNumber: '12A',
      purchaseDate: new Date().toISOString(),
      price: 850,
      status: 'confirmed',
    },
  ],
  airplanes: [
    {
      id: 'A001',
      airlineName: 'JetBlue',
      numberOfSeats: 180,
      manufacturer: 'Boeing',
      age: 5,
    },
    {
      id: 'A002',
      airlineName: 'JetBlue',
      numberOfSeats: 200,
      manufacturer: 'Airbus',
      age: 3,
    },
  ],
  ratings: [
    {
      id: 'R001',
      flightId: 'F001',
      customerEmail: 'john@email.com',
      rating: 4.5,
      comment: 'Great service!',
      date: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
}

