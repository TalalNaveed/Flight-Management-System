import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Public pages
import HomePage from './pages/public/HomePage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import FlightSearchPage from './pages/public/FlightSearchPage'

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard'
import MyFlightsPage from './pages/customer/MyFlightsPage'
import PurchasePage from './pages/customer/PurchasePage'
import RatingsPage from './pages/customer/RatingsPage'

// Staff pages
import StaffDashboard from './pages/staff/StaffDashboard'
import ViewFlightsPage from './pages/staff/ViewFlightsPage'
import CreateFlightPage from './pages/staff/CreateFlightPage'
import AirplanesPage from './pages/staff/AirplanesPage'
import ReportsPage from './pages/staff/ReportsPage'

const theme = createTheme({
  palette: {
    primary: {
      main: '#003366',
      light: '#004d99',
      dark: '#001a33',
    },
    secondary: {
      main: '#0099cc',
      light: '#33b3ff',
      dark: '#006699',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    error: {
      main: '#d32f2f',
    },
    success: {
      main: '#388e3c',
    },
    warning: {
      main: '#f57c00',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.5rem', fontWeight: 600 },
    h4: { fontSize: '1.25rem', fontWeight: 600 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
          },
        },
      },
    },
  },
})

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/search" element={<FlightSearchPage />} />

            {/* Customer Routes */}
            <Route element={<ProtectedRoute role="customer" />}>
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/customer/flights" element={<MyFlightsPage />} />
              <Route path="/customer/purchase" element={<PurchasePage />} />
              <Route path="/customer/ratings" element={<RatingsPage />} />
            </Route>

            {/* Staff Routes */}
            <Route element={<ProtectedRoute role="staff" />}>
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/flights" element={<ViewFlightsPage />} />
              <Route path="/staff/flights/create" element={<CreateFlightPage />} />
              <Route path="/staff/airplanes" element={<AirplanesPage />} />
              <Route path="/staff/reports" element={<ReportsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}
