import { Box, Container, Paper, TextField, Button, Typography, Card, CardContent, Grid, Alert, CircularProgress, MenuItem } from '@mui/material'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { purchaseTicket } from '../../services/mockApi'

export default function PurchasePage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [cardType, setCardType] = useState<'credit' | 'debit'>('credit')
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [ticketId, setTicketId] = useState('')
  const [cardError, setCardError] = useState('')
  const [expiryError, setExpiryError] = useState('')
  const navigate = useNavigate()

  const validateCard = () => {
    setCardError('')
    setExpiryError('')
    
    const digitsOnly = cardNumber.replace(/\s/g, '')
    
    // Validate card number length (12-32 digits to match backend)
    if (!digitsOnly) {
      setCardError('Card number is required')
      return false
    }
    if (!/^\d+$/.test(digitsOnly)) {
      setCardError('Card number must contain only digits')
      return false
    }
    if (digitsOnly.length < 12 || digitsOnly.length > 32) {
      setCardError('Card number must be between 12 and 32 digits')
      return false
    }
    
    // Validate expiry format
    if (!cardExpiry) {
      setExpiryError('Expiry date is required')
      return false
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      setExpiryError('Expiry must be in MM/YY format (e.g., 12/25)')
      return false
    }
    
    // Validate expiry date is not in the past
    const [mm, yy] = cardExpiry.split('/')
    const month = parseInt(mm, 10)
    const year = parseInt(yy, 10)
    
    if (month < 1 || month > 12) {
      setExpiryError('Month must be between 01 and 12')
      return false
    }
    
    const expDate = new Date(Number(`20${year}`), month - 1, 1)
    const now = new Date()
    if (expDate < new Date(now.getFullYear(), now.getMonth(), 1)) {
      setExpiryError('Card has expired')
      return false
    }
    
    return true
  }

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateCard()) {
      return
    }

    if (!user?.email) {
      alert('Please log in to purchase tickets')
      navigate('/login')
      return
    }

    const flightId = searchParams.get('flightId')
    const outboundId = searchParams.get('outboundId')
    const returnId = searchParams.get('returnId')
    if (!flightId) {
      // If round-trip, allow outbound+return
      if (!outboundId || !returnId) {
        alert('No flight selected')
        navigate('/search')
        return
      }
    }

    setIsLoading(true)
    try {
      if (outboundId && returnId) {
        // Round-trip: purchase both sequentially
        const outbound = await purchaseTicket(
          outboundId,
          { cardType, cardNumber, nameOnCard: cardName, expiration: cardExpiry }
        )
        const inbound = await purchaseTicket(
          returnId,
          { cardType, cardNumber, nameOnCard: cardName, expiration: cardExpiry }
        )
        setTicketId(`${outbound.ticketId}, ${inbound.ticketId}`)
        setSuccess(true)
      } else if (flightId) {
        const data = await purchaseTicket(
          flightId,
          { cardType, cardNumber, nameOnCard: cardName, expiration: cardExpiry }
        )
        setTicketId(data.ticketId)
        setSuccess(true)
      }
    } catch (err: any) {
      alert(err.message || 'Purchase failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <>
        <Navbar />
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Purchase Successful!
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Your ticket ID: <strong>{ticketId}</strong>
              </Typography>
              <Button variant="contained" color="primary" fullWidth onClick={() => navigate('/customer/flights')}>
                View My Flights
              </Button>
            </CardContent>
          </Card>
        </Container>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Payment Details
          </Typography>

          <form onSubmit={handlePurchase}>
            <TextField
              fullWidth
              label="Cardholder Name"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => {
                setCardNumber(e.target.value)
                setCardError('')
              }}
              margin="normal"
              required
              error={!!cardError}
              helperText={cardError || 'Enter 12-32 digits'}
              inputProps={{ maxLength: 32 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiry (MM/YY)"
                  placeholder="12/25"
                  value={cardExpiry}
                  onChange={(e) => {
                    setCardExpiry(e.target.value)
                    setExpiryError('')
                  }}
                  required
                  error={!!expiryError}
                  helperText={expiryError || 'MM/YY format'}
                  inputProps={{ maxLength: 5 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  label="Card Type"
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value as 'credit' | 'debit')}
                  required
                >
                  <MenuItem value="credit">Credit</MenuItem>
                  <MenuItem value="debit">Debit</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              disabled={isLoading}
              sx={{ mt: 3 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Complete Purchase'}
            </Button>
          </form>
        </Paper>
      </Container>
    </>
  )
}
