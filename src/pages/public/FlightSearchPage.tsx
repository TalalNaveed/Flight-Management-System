import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Pagination,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Fade,
} from '@mui/material'
import { FlightTakeoff, FlightLand, CalendarToday, People, Search, ArrowForward } from '@mui/icons-material'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { searchFlights } from '../../services/mockApi'

interface Flight {
  id: string
  airline: string
  flightNumber: string
  depAirport: string
  arrAirport: string
  depDatetime: string
  arrDatetime: string
  basePrice: number
  status: 'on-time' | 'delayed'
  seatsAvailable: number
}

export default function FlightSearchPage() {
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way')
  const [fromCity, setFromCity] = useState('JFK')
  const [toCity, setToCity] = useState('PVG')
  const [departDate, setDepartDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [passengers, setPassengers] = useState('1')
  const [flights, setFlights] = useState<Flight[]>([])
  const [returnFlights, setReturnFlights] = useState<Flight[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedOutbound, setSelectedOutbound] = useState<string | null>(null)
  const [selectedReturn, setSelectedReturn] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      const data = await searchFlights({
        fromCity,
        toCity,
        departureDate: departDate,
        returnDate: tripType === 'round-trip' ? returnDate : undefined,
        page: '1',
        pageSize: '50',
      })
      setFlights(data.flights || [])
      setTotal(data.total || 0)
      // If round-trip, fetch return-leg flights (swap from/to and use returnDate if provided)
      if (tripType === 'round-trip') {
        console.log('🔄 Fetching return flights from', toCity, 'to', fromCity, returnDate ? `on ${returnDate}` : '(any future date)')
        try {
          const ret = await searchFlights({
            fromCity: toCity,
            toCity: fromCity,
            departureDate: returnDate || '', // Empty string = no date filter, returns all future flights
            page: '1',
            pageSize: '50',
          })
          console.log('✅ Return flights:', ret.flights?.length || 0)
          setReturnFlights(ret.flights || [])
        } catch (err) {
          console.error('Return leg search failed', err)
          setReturnFlights([])
        }
      } else {
        setReturnFlights([])
      }
    } catch (err) {
      console.error('Search failed', err)
      alert('Failed to search flights. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (departDate) {
      handleSearch()
    }
  }, [fromCity, toCity, departDate, tripType, returnDate])

  // Derived selection objects
  const selectedOutboundObj = selectedOutbound ? flights.find(f => f.id === selectedOutbound) : undefined
  const selectedReturnObj = selectedReturn ? returnFlights.find(f => f.id === selectedReturn) : undefined
  const canPurchaseRoundTrip = Boolean(selectedOutbound && selectedReturn && (selectedOutboundObj?.seatsAvailable ?? 0) > 0 && (selectedReturnObj?.seatsAvailable ?? 0) > 0)

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
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, textAlign: 'center' }}>
            ✈️ Search Flights
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', opacity: 0.9 }}>
            Find the perfect flight for your next adventure
          </Typography>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            boxShadow: 4,
            background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)',
          }}
        >
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#003366' }}>
            Search Flights
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Trip Type</InputLabel>
                <Select value={tripType} onChange={(e) => setTripType(e.target.value as any)} label="Trip Type">
                  <MenuItem value="one-way">One Way</MenuItem>
                  <MenuItem value="round-trip">Round Trip</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="From"
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                InputProps={{
                  startAdornment: <FlightTakeoff sx={{ mr: 1, color: '#0099cc' }} />,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="To"
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                InputProps={{
                  startAdornment: <FlightLand sx={{ mr: 1, color: '#0099cc' }} />,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Depart Date"
                type="date"
                value={departDate}
                onChange={(e) => setDepartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarToday sx={{ mr: 1, color: '#0099cc' }} />,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Passengers"
                type="number"
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
                InputProps={{
                  startAdornment: <People sx={{ mr: 1, color: '#0099cc' }} />,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            {tripType === 'round-trip' && (
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Return Date"
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={handleSearch}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Search />}
                sx={{
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
                {isLoading ? 'Searching...' : 'Search Flights'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {flights.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#003366' }}>
              ✈️ {total} flights found
            </Typography>
            <Grid container spacing={3}>
              {flights.map((flight, idx) => (
                <Grid item xs={12} key={flight.id}>
                  <Fade in timeout={500 + idx * 100}>
                      <Card
                      sx={{
                          backgroundColor: flight.status === 'delayed' ? '#fff3e0' : 'white',
                        borderRadius: 3,
                        boxShadow: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 6,
                        },
                          border: selectedOutbound === flight.id ? '3px solid #1976d2' : (flight.status === 'delayed' ? '2px solid #ff9800' : '1px solid #e0e0e0'),
                      }}
                        onClick={() => setSelectedOutbound(flight.id)}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={3} alignItems="center">
                          <Grid item xs={12} sm={2}>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                              {flight.airline}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#003366' }}>
                              {flight.flightNumber}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <FlightTakeoff sx={{ color: '#0099cc', fontSize: 20 }} />
                              <Typography variant="body2" color="textSecondary">
                                Departure
                              </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {flight.depAirport}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {new Date(flight.depDatetime).toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={1} sx={{ textAlign: 'center' }}>
                            <ArrowForward sx={{ color: '#0099cc' }} />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <FlightLand sx={{ color: '#0099cc', fontSize: 20 }} />
                              <Typography variant="body2" color="textSecondary">
                                Arrival
                              </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {flight.arrAirport}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {new Date(flight.arrDatetime).toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={3} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                            <Typography variant="h5" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                              ${flight.basePrice}
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                              <Chip
                                label={flight.status === 'delayed' ? 'DELAYED' : 'ON TIME'}
                                color={flight.status === 'delayed' ? 'warning' : 'success'}
                                size="small"
                                sx={{ fontWeight: 600, mr: 1 }}
                              />
                              <Chip label={`${flight.seatsAvailable} seats`} size="small" variant="outlined" />
                            </Box>
                            {user?.role === 'customer' && (
                              <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={flight.seatsAvailable === 0 || tripType === 'round-trip'}
                                onClick={() => navigate(`/customer/purchase?flightId=${flight.id}`)}
                                sx={{
                                  borderRadius: 2,
                                  fontWeight: 600,
                                  boxShadow: 2,
                                  '&:hover': {
                                    boxShadow: 4,
                                  },
                                }}
                              >
                                {flight.seatsAvailable === 0 ? 'Sold Out' : (tripType === 'round-trip' ? 'Select return flight' : 'Purchase')}
                              </Button>
                            )}
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {!isLoading && flights.length === 0 && departDate && (
          <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
            No flights found. Try adjusting your search criteria.
          </Typography>
        )}

        {tripType === 'round-trip' && returnFlights.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 4, mb: 3, fontWeight: 600, color: '#003366' }}>
              🔁 Return Flights
            </Typography>
            <Grid container spacing={3}>
                    {returnFlights.map((flight, idx) => (
                      <Grid item xs={12} key={`ret-${flight.id}`}>
                        <Fade in timeout={500 + idx * 100}>
                          <Card
                            sx={{
                              backgroundColor: flight.status === 'delayed' ? '#fff3e0' : 'white',
                              borderRadius: 3,
                              boxShadow: 3,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 6,
                              },
                              border: selectedReturn === flight.id ? '3px solid #1976d2' : (flight.status === 'delayed' ? '2px solid #ff9800' : '1px solid #e0e0e0'),
                            }}
                            onClick={() => setSelectedReturn(flight.id)}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Grid container spacing={3} alignItems="center">
                                <Grid item xs={12} sm={2}>
                                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                                    {flight.airline}
                                  </Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#003366' }}>
                                    {flight.flightNumber}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <FlightTakeoff sx={{ color: '#0099cc', fontSize: 20 }} />
                                    <Typography variant="body2" color="textSecondary">
                                      Departure
                                    </Typography>
                                  </Box>
                                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {flight.depAirport}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {new Date(flight.depDatetime).toLocaleString()}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={1} sx={{ textAlign: 'center' }}>
                                  <ArrowForward sx={{ color: '#0099cc' }} />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <FlightLand sx={{ color: '#0099cc', fontSize: 20 }} />
                                    <Typography variant="body2" color="textSecondary">
                                      Arrival
                                    </Typography>
                                  </Box>
                                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {flight.arrAirport}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {new Date(flight.arrDatetime).toLocaleString()}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={3} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                                  <Typography variant="h5" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                                    ${flight.basePrice}
                                  </Typography>
                                  <Box sx={{ mb: 2 }}>
                                    <Chip
                                      label={flight.status === 'delayed' ? 'DELAYED' : 'ON TIME'}
                                      color={flight.status === 'delayed' ? 'warning' : 'success'}
                                      size="small"
                                      sx={{ fontWeight: 600, mr: 1 }}
                                    />
                                    <Chip label={`${flight.seatsAvailable} seats`} size="small" variant="outlined" />
                                  </Box>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Fade>
                      </Grid>
                    ))}
            </Grid>
          </>
        )}

        {tripType === 'round-trip' && selectedOutbound && selectedReturn && (
          <Box sx={{ mt: 4, p: 2, border: '1px dashed #e0e0e0', borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Selected Flights
            </Typography>
            <Typography variant="body2">
              Outbound: {selectedOutbound || 'None selected'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Return: {selectedReturn || 'None selected'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              disabled={!canPurchaseRoundTrip}
              onClick={() => navigate(`/customer/purchase?outboundId=${selectedOutbound}&returnId=${selectedReturn}`)}
            >
              Purchase Round-Trip
            </Button>
          </Box>
        )}

        {!isLoading && flights.length === 0 && departDate && (
          <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
            No flights found. Try adjusting your search criteria.
          </Typography>
        )}
      </Container>
    </>
  )
}
