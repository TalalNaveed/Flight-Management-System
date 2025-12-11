import { Box, Container, Card, CardContent, TextField, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { getCustomerTickets } from '../../services/mockApi'

export default function MyFlightsPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<any[]>([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showPreviousFlights, setShowPreviousFlights] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const loadTickets = async () => {
    if (!user?.email) return

    setIsLoading(true)
    try {
      const data = await getCustomerTickets({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
      setTickets(data.tickets || [])
    } catch (err) {
      console.error('Failed to load tickets', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [user, dateFrom, dateTo])

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
          My Flights
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
              Filter by Date Range
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                type="date"
                label="From"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="date"
                label="To"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Button variant="contained" color="primary" onClick={loadTickets} disabled={isLoading}>
                Filter
              </Button>
              <Button 
                variant={showPreviousFlights ? "contained" : "outlined"}
                color={showPreviousFlights ? "secondary" : "primary"}
                onClick={() => setShowPreviousFlights(!showPreviousFlights)}
                disabled={isLoading}
              >
                {showPreviousFlights ? 'Upcoming Flights' : 'Previous Flights'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Ticket ID</strong></TableCell>
                <TableCell>Airline Name</TableCell>
                <TableCell>Flight Number</TableCell>
                <TableCell>Departure Date/Time</TableCell>
                <TableCell>Arrival Date/Time</TableCell>
                <TableCell>Flight Status</TableCell>
                <TableCell>Departure Airport</TableCell>
                <TableCell>Arrival Airport</TableCell>
                <TableCell>Airplane ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography>Loading flights...</Typography>
                  </TableCell>
                </TableRow>
              ) : tickets
                .filter((ticket) => {
                  // Filter based on showPreviousFlights state
                  const depDate = ticket.depDatetime ? new Date(ticket.depDatetime) : null;
                  if (!depDate) return false;
                  
                  const now = new Date();
                  if (showPreviousFlights) {
                    // Show past flights (departure date/time is in the past)
                    return depDate <= now;
                  } else {
                    // Show future flights (departure date/time is in the future)
                    return depDate > now;
                  }
                })
                .length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      {showPreviousFlights ? 'No previous flights found' : 'No upcoming flights'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tickets
                  .filter((ticket) => {
                    // Filter based on showPreviousFlights state
                    const depDate = ticket.depDatetime ? new Date(ticket.depDatetime) : null;
                    if (!depDate) return false;
                    
                    const now = new Date();
                    if (showPreviousFlights) {
                      // Show past flights (departure date/time is in the past)
                      return depDate <= now;
                    } else {
                      // Show future flights (departure date/time is in the future)
                      return depDate > now;
                    }
                  })
                  .map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell sx={{ fontWeight: 600 }}>{ticket.id || ticket.ticketId}</TableCell>
                    <TableCell>{ticket.airline}</TableCell>
                    <TableCell>{ticket.flightNumber}</TableCell>
                    <TableCell>{new Date(ticket.depDatetime).toLocaleString()}</TableCell>
                    <TableCell>{new Date(ticket.arrDatetime).toLocaleString()}</TableCell>
                    <TableCell sx={{ 
                      color: ticket.flightStatus === 'on-time' ? 'success.main' : 
                             ticket.flightStatus === 'delayed' ? 'warning.main' : 'error.main',
                      fontWeight: 600
                    }}>
                      {ticket.flightStatus || 'on-time'}
                    </TableCell>
                    <TableCell>{ticket.depAirport}</TableCell>
                    <TableCell>{ticket.arrAirport}</TableCell>
                    <TableCell>{ticket.airplaneId}</TableCell>
                  </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </>
  )
}
