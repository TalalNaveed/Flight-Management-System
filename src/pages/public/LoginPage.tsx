import { Box, Container, Paper, TextField, Button, Typography, Alert, CircularProgress, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'

export default function LoginPage() {
  const [userType, setUserType] = useState<'customer' | 'staff'>('customer')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, error } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(username, password)
      navigate(userType === 'customer' ? '/customer/dashboard' : '/staff/dashboard')
    } catch (err) {
      // Error is handled by context
    }
  }

  return (
    <>
      <Navbar />
      <Box
        sx={{
          background: 'linear-gradient(135deg, #003366 0%, #0099cc 100%)',
          color: 'white',
          py: 4,
          mb: 4,
        }}
      >
        <Container>
          <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center' }}>
            ✈️ Login to AirBook
          </Typography>
        </Container>
      </Box>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            boxShadow: 6,
            background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)',
          }}
        >
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, textAlign: 'center', color: '#003366' }}>
            Welcome Back
          </Typography>

          <ToggleButtonGroup
            value={userType}
            exclusive
            onChange={(e, newType) => newType && setUserType(newType)}
            fullWidth
            sx={{
              mb: 3,
              '& .MuiToggleButton-root': {
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                '&.Mui-selected': {
                  backgroundColor: '#003366',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#004d99',
                  },
                },
              },
            }}
          >
            <ToggleButton value="customer">Customer</ToggleButton>
            <ToggleButton value="staff">Airline Staff</ToggleButton>
          </ToggleButtonGroup>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={userType === 'customer' ? 'Email' : 'Username'}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              margin="normal"
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              disabled={isLoading}
              sx={{
                mt: 3,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: 3,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 6,
                },
                transition: 'all 0.3s ease',
              }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>

          <Typography sx={{ mt: 3, textAlign: 'center' }}>
            <Typography component={RouterLink} to="/register" variant="body2" color="primary" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              Don't have an account? Register here
            </Typography>
          </Typography>
        </Paper>
      </Container>
    </>
  )
}
