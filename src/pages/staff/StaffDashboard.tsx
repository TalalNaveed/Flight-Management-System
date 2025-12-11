import { Box, Container, Grid, Card, CardContent, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getStaffFlights } from '../../services/mockApi'

export default function StaffDashboard() {
  const [flightsCount, setFlightsCount] = useState(0)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    // Load actual number of active flights for this staff's airline for the next 30 days
    async function loadCount() {
      if (!user || user.role !== 'staff') {
        setFlightsCount(0)
        return
      }

      try {
        const today = new Date()
        const toDate = new Date()
        toDate.setDate(today.getDate() + 30)

        const pad = (n: number) => n.toString().padStart(2, '0')
        const toIsoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

        const filters = { dateFrom: toIsoDate(today), dateTo: toIsoDate(toDate) }
        const data = await getStaffFlights(filters)
        const count = (data?.flights || []).length
        setFlightsCount(count)
      } catch (err) {
        console.error('Failed to load staff flights count', err)
        setFlightsCount(0)
      }
    }

    loadCount()
  }, [])

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" sx={{ mb: 4, fontWeight: 600 }}>
          Staff Dashboard
        </Typography>

        <Grid container spacing={3}>
          {[
            { title: 'View Flights', action: () => navigate('/staff/flights') },
            { title: 'Create Flight', action: () => navigate('/staff/flights/create') },
            { title: 'Manage Airplanes', action: () => navigate('/staff/airplanes') },
            { title: 'View Reports', action: () => navigate('/staff/reports') },
          ].map((item, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    {item.title}
                  </Typography>
                  <Button variant="contained" color="primary" fullWidth onClick={item.action}>
                    Go
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Quick Stats
            </Typography>
            <Typography variant="body1">
              Active Flights Next 30 Days: <strong>{flightsCount}</strong>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </>
  )
}
