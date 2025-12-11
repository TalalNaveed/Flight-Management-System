import express from 'express'
import cors from 'cors'
import session from 'express-session'

// Import routes
import authRoutes from './routes/auth.routes'
import flightsRoutes from './routes/flights.routes'
import ticketsRoutes from './routes/tickets.routes'
import customersRoutes from './routes/customers.routes'
import ratingsRoutes from './routes/ratings.routes'
import staffRoutes from './routes/staff.routes'
import reportsRoutes from './routes/reports.routes'

const app = express()
const PORT = 3000

// Session configuration
app.use(session({
  secret: 'airbook-secret-key-change-in-production', // Change this in production!
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}))

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Frontend URLs (Vite may use different ports)
  credentials: true, // Allow cookies/sessions
}))
app.use(express.json())

// Root route - API info
app.get('/', (req, res) => {
  res.json({
    message: 'Flight Booking API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login (creates session)',
        logout: 'POST /api/auth/logout (destroys session)',
        registerCustomer: 'POST /api/auth/register/customer',
        registerStaff: 'POST /api/auth/register/staff',
      },
      flights: {
        search: 'GET /api/flights',
        ratings: 'GET /api/flights/:flightId/ratings',
      },
      tickets: {
        getCustomerTickets: 'GET /api/customers/tickets (requires customer session)',
        purchase: 'POST /api/tickets/purchase (requires customer session)',
      },
      ratings: {
        submit: 'POST /api/ratings (requires customer session)',
      },
      staff: {
        getFlights: 'GET /api/staff/flights (requires staff session)',
        createFlight: 'POST /api/staff/flights (requires staff session)',
        changeFlightStatus: 'PATCH /api/staff/flights/:flightId/status (requires staff session)',
        getFlightPassengers: 'GET /api/staff/flights/:flightId/passengers (requires staff session)',
        getAirplanes: 'GET /api/staff/airplanes (requires staff session)',
        addAirplane: 'POST /api/staff/airplanes (requires staff session)',
      },
      reports: {
        sales: 'GET /api/reports/sales (requires staff session)',
      },
    },
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/flights', flightsRoutes)
app.use('/api/tickets', ticketsRoutes)
app.use('/api/customers', customersRoutes)
app.use('/api/ratings', ratingsRoutes)
app.use('/api/staff', staffRoutes)
app.use('/api/reports', reportsRoutes)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`)
})
