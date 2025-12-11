import { Box, Container, Typography, Button, Grid, Card, CardContent, Fade } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { FlightTakeoff, Search, PersonAdd, Login, Security, Support, Payment } from '@mui/icons-material'
import Navbar from '../../components/Navbar'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Box
        sx={{
          background: 'linear-gradient(135deg, #003366 0%, #0099cc 100%)',
          color: 'white',
          py: { xs: 6, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.1,
          },
        }}
      >
        <Container>
          <Fade in timeout={1000}>
            <Box>
              <Typography
                variant="h1"
                sx={{
                  mb: 3,
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                ✈️ Find Your Perfect Flight
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 5,
                  opacity: 0.95,
                  fontSize: { xs: '1.1rem', md: '1.5rem' },
                  maxWidth: '600px',
                }}
              >
                Book flights with AirBook. Simple, fast, and reliable. Your journey starts here.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  component={RouterLink}
                  to="/search"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    boxShadow: 4,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 6,
                    },
                    transition: 'all 0.3s ease',
                  }}
                  startIcon={<Search />}
                >
                  Search Flights
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  component={RouterLink}
                  to="/register"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  startIcon={<PersonAdd />}
                >
                  Register
                </Button>
                <Button
                  variant="text"
                  color="inherit"
                  component={RouterLink}
                  to="/login"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                  startIcon={<Login />}
                >
                  Login
                </Button>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container sx={{ py: { xs: 6, md: 10 } }}>
        <Typography
          variant="h3"
          sx={{
            mb: 6,
            textAlign: 'center',
            fontWeight: 700,
            background: 'linear-gradient(45deg, #003366 30%, #0099cc 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Why Choose AirBook?
        </Typography>
        <Grid container spacing={4}>
          {[
            {
              title: 'Best Prices',
              desc: 'Find the most competitive fares with our smart search engine',
              icon: <Payment sx={{ fontSize: 40 }} />,
              color: '#e3f2fd',
              iconColor: '#1976d2',
            },
            {
              title: 'Easy Booking',
              desc: 'Simple 3-step booking process - search, select, and fly',
              icon: <FlightTakeoff sx={{ fontSize: 40 }} />,
              color: '#f3e5f5',
              iconColor: '#7b1fa2',
            },
            {
              title: '24/7 Support',
              desc: 'Our team is always here to help you with any questions',
              icon: <Support sx={{ fontSize: 40 }} />,
              color: '#e8f5e9',
              iconColor: '#388e3c',
            },
            {
              title: 'Secure Payment',
              desc: 'Safe and encrypted transactions for your peace of mind',
              icon: <Security sx={{ fontSize: 40 }} />,
              color: '#fff3e0',
              iconColor: '#f57c00',
            },
          ].map((item, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Fade in timeout={1000 + idx * 200}>
                <Card
                  sx={{
                    height: '100%',
                    backgroundColor: item.color,
                    borderRadius: 3,
                    boxShadow: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{ color: item.iconColor, mb: 2 }}>{item.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#333' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>
                      {item.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  )
}
