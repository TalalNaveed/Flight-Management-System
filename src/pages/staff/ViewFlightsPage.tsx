import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  IconButton,
  Collapse,
  Rating,
  Divider,
  Tooltip,
} from '@mui/material'
import { useState, useEffect } from 'react'
import { ExpandMore, ExpandLess, Edit, Star } from '@mui/icons-material'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { getStaffFlights, changeFlightStatus, getFlightRatings } from '../../services/mockApi'

export default function ViewFlightsPage() {
  const { user } = useAuth()
  const [flights, setFlights] = useState<any[]>([])
  const [expandedFlight, setExpandedFlight] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [showAllFlights, setShowAllFlights] = useState(false)
  const [statusDialog, setStatusDialog] = useState<{ open: boolean; flight: any | null }>({ open: false, flight: null })
  const [newStatus, setNewStatus] = useState('on-time')
  const [ratingsDialog, setRatingsDialog] = useState<{ open: boolean; flightId: string | null; ratings: any[] }>({
    open: false,
    flightId: null,
    ratings: [],
  })
  const [passengers, setPassengers] = useState<{ [key: string]: any[] }>({})

  // Helper function to get date range for next 30 days
  const getNext30DaysRange = () => {
    const today = new Date()
    const thirtyDaysLater = new Date()
    thirtyDaysLater.setDate(today.getDate() + 30)
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    return {
      from: formatDate(today),
      to: formatDate(thirtyDaysLater)
    }
  }

  const loadFlights = async () => {
    if (!user?.username) {
      console.log('No user username found')
      return
    }

    try {
      // Build filters
      const filters: any = {}
      
      // If not showing all flights, default to next 30 days
      if (!showAllFlights) {
        const dateRange = getNext30DaysRange()
        // Only use date range if user hasn't manually set date filters
        if (!dateFrom && !dateTo) {
          filters.dateFrom = dateRange.from
          filters.dateTo = dateRange.to
        } else {
          // User has set manual date filters, use those
          if (dateFrom && dateFrom.trim()) filters.dateFrom = dateFrom.trim()
          if (dateTo && dateTo.trim()) filters.dateTo = dateTo.trim()
        }
      } else {
        // Showing all flights - only include date filters if user manually set them
        if (dateFrom && dateFrom.trim()) filters.dateFrom = dateFrom.trim()
        if (dateTo && dateTo.trim()) filters.dateTo = dateTo.trim()
      }
      
      // Always include source and destination if set
      if (source && source.trim()) filters.source = source.trim()
      if (destination && destination.trim()) filters.destination = destination.trim()

      console.log('Loading flights with filters:', filters)
      console.log('User:', user)
      const data = await getStaffFlights(Object.keys(filters).length > 0 ? filters : undefined)
      console.log('Flights data received:', data)
      console.log('Flights array:', data.flights)
      console.log('Number of flights (raw):', data.flights?.length || 0)

      // Remove any accidental duplicates by flight ID
      const uniqueFlightsMap = new Map<string, any>()
      ;(data.flights || []).forEach((flight: any) => {
        if (!uniqueFlightsMap.has(flight.id)) {
          uniqueFlightsMap.set(flight.id, flight)
        }
      })

      const uniqueFlights = Array.from(uniqueFlightsMap.values())
      console.log('Number of flights (unique):', uniqueFlights.length)
      setFlights(uniqueFlights)
    } catch (err) {
      console.error('Failed to load flights', err)
      alert('Failed to load flights: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  // Load flights on mount (default to next 30 days)
  useEffect(() => {
    loadFlights()
  }, [user])

  // Reload flights when showAllFlights changes
  useEffect(() => {
    if (user?.username) {
      loadFlights()
    }
  }, [showAllFlights])

  const handleOpenStatusDialog = (flight: any) => {
    setStatusDialog({ open: true, flight })
    setNewStatus(flight.status)
  }

  const handleChangeStatus = async () => {
    if (!statusDialog.flight || !user?.username) return

    // Double-check on frontend (backend will also validate)
    if (isFlightInPast(statusDialog.flight)) {
      alert('Cannot change status for flights in the past. The flight\'s departure time has already passed.')
      setStatusDialog({ open: false, flight: null })
      return
    }

    try {
      await changeFlightStatus(statusDialog.flight.id, newStatus)
      await loadFlights()
      setStatusDialog({ open: false, flight: null })
    } catch (err: any) {
      alert(err.message || 'Failed to change status')
    }
  }

  const handleViewRatings = async (flightId: string) => {
    try {
      const data = await getFlightRatings(flightId)
      setRatingsDialog({ open: true, flightId, ratings: data.ratings || [] })
    } catch (err) {
      console.error('Failed to load ratings', err)
    }
  }

  const handleViewPassengers = async (flight: any) => {
    if (expandedFlight === flight.id) {
      setExpandedFlight(null)
      return
    }
    setExpandedFlight(flight.id)
    // Passengers are already included in flight data from backend
    if (flight.passengerTickets) {
      setPassengers({ ...passengers, [flight.id]: flight.passengerTickets })
    }
  }

  const isFlightInPast = (flight: any) => {
    if (!flight.depDatetime) return false
    const depDateTime = new Date(flight.depDatetime)
    const now = new Date()
    return depDateTime < now
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, background: 'linear-gradient(45deg, #003366 30%, #0099cc 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Flight Management
        </Typography>

        <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Filter Flights
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="From Date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="To Date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Source Airport"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g., JFK"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Destination Airport"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g., LAX"
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" color="primary" onClick={loadFlights} sx={{ mr: 2 }}>
                  Apply Filters
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSource('')
                    setDestination('')
                    setDateFrom('')
                    setDateTo('')
                    setShowAllFlights(false)
                    loadFlights()
                  }}
                  sx={{ mr: 2 }}
                >
                  Clear Filters
                </Button>
                <Button
                  variant={showAllFlights ? "contained" : "outlined"}
                  onClick={() => {
                    if (showAllFlights) {
                      // Switch back to next 30 days view
                      setShowAllFlights(false)
                      setDateFrom('')
                      setDateTo('')
                    } else {
                      // Switch to all flights view
                      setShowAllFlights(true)
                      setDateFrom('')
                      setDateTo('')
                    }
                    // Don't clear source and destination when switching views
                    loadFlights()
                  }}
                >
                  {showAllFlights ? 'Next 30 Days' : 'All Flights'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#003366' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Flight #</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Route</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Departure</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Passengers</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flights.map((flight) => (
                <>
                  <TableRow key={flight.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {flight.flightNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {flight.depAirport} → {flight.arrAirport}
                      </Typography>
                    </TableCell>
                    <TableCell>{new Date(flight.depDatetime).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={flight.status}
                        color={flight.status === 'on-time' ? 'success' : 'error'}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      {flight.passengers || 0}/{flight.totalSeats || 200}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewPassengers(flight)}
                          title="View Passengers"
                        >
                          {expandedFlight === flight.id ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                        <Tooltip
                          title={isFlightInPast(flight) ? "Cannot change status for flights in the past" : "Change Status"}
                        >
                          <span>
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleOpenStatusDialog(flight)}
                              disabled={isFlightInPast(flight)}
                              title={isFlightInPast(flight) ? "Cannot change status for flights in the past" : "Change Status"}
                            >
                              <Edit />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => handleViewRatings(flight.id)}
                          title="View Ratings"
                        >
                          <Star />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={6} sx={{ py: 0, border: 0 }}>
                      <Collapse in={expandedFlight === flight.id} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 3, backgroundColor: '#f9f9f9' }}>
                          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Passengers ({flight.passengerTickets?.length || 0})
                          </Typography>
                          {flight.passengerTickets && flight.passengerTickets.length > 0 ? (
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Ticket ID</TableCell>
                                  <TableCell>Customer Email</TableCell>
                                  <TableCell>Seat</TableCell>
                                  <TableCell>Purchase Date</TableCell>
                                  <TableCell>Price</TableCell>
                                  <TableCell>Status</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {flight.passengerTickets.map((ticket: any) => (
                                  <TableRow key={ticket.id}>
                                    <TableCell>{ticket.id}</TableCell>
                                    <TableCell>{ticket.customerEmail}</TableCell>
                                    <TableCell>{ticket.seatNumber}</TableCell>
                                    <TableCell>{new Date(ticket.purchaseDate).toLocaleDateString()}</TableCell>
                                    <TableCell>${ticket.price}</TableCell>
                                    <TableCell>
                                      <Chip
                                        label={ticket.status}
                                        size="small"
                                        color={ticket.status === 'confirmed' ? 'success' : 'default'}
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              No passengers for this flight
                            </Typography>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {flights.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="textSecondary">
              No flights found. Try adjusting your filters.
            </Typography>
          </Box>
        )}
      </Container>

      {/* Change Status Dialog */}
      <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false, flight: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Change Flight Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Flight: {statusDialog.flight?.flightNumber} ({statusDialog.flight?.depAirport} → {statusDialog.flight?.arrAirport})
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} label="Status">
              <MenuItem value="on-time">On Time</MenuItem>
              <MenuItem value="delayed">Delayed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ open: false, flight: null })}>Cancel</Button>
          <Button variant="contained" onClick={handleChangeStatus}>
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ratings Dialog */}
      <Dialog
        open={ratingsDialog.open}
        onClose={() => setRatingsDialog({ open: false, flightId: null, ratings: [] })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Flight Ratings & Comments</DialogTitle>
        <DialogContent>
          {ratingsDialog.ratings.length > 0 ? (
            <>
              <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Average Rating
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Rating
                    value={ratingsDialog.ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratingsDialog.ratings.length}
                    readOnly
                    precision={0.1}
                  />
                  <Typography variant="h6">
                    {(
                      ratingsDialog.ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratingsDialog.ratings.length
                    ).toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ({ratingsDialog.ratings.length} reviews)
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {ratingsDialog.ratings.map((rating: any, idx: number) => (
                <Box key={idx} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      {rating.customerEmail}
                    </Typography>
                    <Rating value={rating.rating} readOnly size="small" />
                  </Box>
                  {rating.comment && (
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {rating.comment}
                    </Typography>
                  )}
                  <Typography variant="caption" color="textSecondary">
                    {new Date(rating.date).toLocaleDateString()}
                  </Typography>
                </Box>
              ))}
            </>
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
              No ratings yet for this flight
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingsDialog({ open: false, flightId: null, ratings: [] })}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
