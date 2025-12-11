import { Box, Container, Card, CardContent, TextField, Button, Typography, Rating, Grid, Paper } from '@mui/material'
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { getCustomerTickets, submitRating, getCustomerRatings } from '../../services/mockApi'

export default function RatingsPage() {
  const { user } = useAuth()
  const [pastFlights, setPastFlights] = useState<any[]>([])
  const [existingRatings, setExistingRatings] = useState<any[]>([])
  const [selectedFlight, setSelectedFlight] = useState<any>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  useEffect(() => {
    const loadData = async () => {
      if (!user?.email) return

      try {
        const [ticketsData, ratingsData] = await Promise.all([
          getCustomerTickets(),
          getCustomerRatings()
        ])
        // Filter past flights (departure date in the past)
        const now = new Date()
        const past = (ticketsData.tickets || []).filter((t: any) => new Date(t.depDatetime) < now)

        const ratedMap = new Map(
          (ratingsData.ratings || []).map((r: any) => [r.flightId, r])
        )

        const unratedPastFlights = past.filter((flight: any) => {
          const fid = flight.flightId || flight.id
          return fid && !ratedMap.has(fid)
        })

        setPastFlights(unratedPastFlights)
        setExistingRatings(ratingsData.ratings || [])
      } catch (err) {
        console.error('Failed to load flights', err)
      }
    }

    loadData()
  }, [user])

  const handleSubmitRating = async () => {
    if (!selectedFlight || rating === 0 || !user?.email) return

    try {
      const flightId = selectedFlight.flightId || selectedFlight.id
      const response = await submitRating(flightId, rating, comment)

      const newRating = response.rating || {
        flightId,
        airline: selectedFlight.airline,
        flightNumber: selectedFlight.flightNumber,
        rating,
        comment,
        date: new Date().toISOString()
      }

      setExistingRatings((prev) => [...prev, newRating])
      setPastFlights((prev) => prev.filter((f) => (f.flightId || f.id) !== flightId))
      setRating(0)
      setComment('')
      setSelectedFlight(null)
      alert('Rating submitted successfully!')
    } catch (err: any) {
      alert(err.message || 'Failed to submit rating')
    }
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
          Rate Your Flights
        </Typography>

        {!selectedFlight ? (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Select a flight to rate:
              </Typography>
              {pastFlights.map((flight) => (
                <Button
                  key={flight.id}
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 1, justifyContent: 'flex-start' }}
                  onClick={() => setSelectedFlight(flight)}
                >
                  {flight.airline} {flight.flightNumber} - {flight.depAirport} → {flight.arrAirport}
                </Button>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Rate {selectedFlight.airline} {selectedFlight.flightNumber}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Rating value={rating} onChange={(e, val) => setRating(val || 0)} size="large" />
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" color="primary" onClick={handleSubmitRating}>
                  Submit Rating
                </Button>
                <Button variant="outlined" onClick={() => setSelectedFlight(null)}>
                  Cancel
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
          Previous Ratings
        </Typography>
        <Grid container spacing={2}>
          {existingRatings.map((r, idx) => (
            <Grid item xs={12} md={6} key={idx}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body1">
                  {r.airline} {r.flightNumber}
                </Typography>
                <Box sx={{ my: 1 }}>
                  <Rating value={r.rating} readOnly size="small" />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {r.comment}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  )
}
