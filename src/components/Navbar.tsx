import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    handleMenuClose()
    navigate('/')
  }

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#003366' }}>
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'white', fontWeight: 700, flexGrow: 1 }}>
          ✈ AirBook
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {!user ? (
            <>
              <Button color="inherit" component={RouterLink} to="/">
                Home
              </Button>
              <Button color="inherit" component={RouterLink} to="/search">
                Search
              </Button>
              <Button variant="outlined" color="inherit" component={RouterLink} to="/login">
                Login
              </Button>
              <Button variant="contained" color="secondary" component={RouterLink} to="/register">
                Register
              </Button>
            </>
          ) : (
            <>
              {user.role === 'customer' && (
                <>
                  <Button color="inherit" component={RouterLink} to="/customer/dashboard">
                    Dashboard
                  </Button>
                  <Button color="inherit" component={RouterLink} to="/search">
                    Search
                  </Button>
                  <Button color="inherit" component={RouterLink} to="/customer/flights">
                    My Flights
                  </Button>
                </>
              )}
              {user.role === 'staff' && (
                <>
                  <Button color="inherit" component={RouterLink} to="/staff/dashboard">
                    Dashboard
                  </Button>
                  <Button color="inherit" component={RouterLink} to="/staff/flights">
                    Flights
                  </Button>
                  <Button color="inherit" component={RouterLink} to="/staff/reports">
                    Reports
                  </Button>
                </>
              )}
              <Button color="inherit" onClick={handleMenuOpen}>
                {user.email || user.username}
              </Button>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
