import { Container, Paper, TextField, Button, Typography, Grid, Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { createFlight } from '../../services/mockApi'

export default function CreateFlightPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    flightNumber: '',
    depAirport: 'JFK',
    arrAirport: 'PVG',
    depDatetime: '',
    arrDatetime: '',
    basePrice: '',
    airplaneId: '',
    status: 'on-time',
  })
  const navigate = useNavigate()

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.username) {
      alert('Please log in')
      return
    }

    // Validate that all required fields are filled
    if (!formData.flightNumber || !formData.depDatetime || !formData.arrDatetime || !formData.basePrice || !formData.airplaneId) {
      alert('Please fill in all required fields')
      return
    }

    // Validate that arrival time is after departure time
    const depDate = new Date(formData.depDatetime);
    const arrDate = new Date(formData.arrDatetime);
    if (arrDate <= depDate) {
      alert('Arrival date and time must be after departure date and time')
      return
    }

    try {
      // Convert datetime-local format (YYYY-MM-DDTHH:mm) to MySQL format (YYYY-MM-DD HH:mm:ss)
      const convertToMySQLDatetime = (datetimeLocal: string): string => {
        if (!datetimeLocal) return '';
        // Replace T with space and append :00 for seconds
        return datetimeLocal.replace('T', ' ') + ':00';
      }

      const flightData = {
        ...formData,
        depDatetime: convertToMySQLDatetime(formData.depDatetime),
        arrDatetime: convertToMySQLDatetime(formData.arrDatetime),
        basePrice: parseFloat(formData.basePrice),
      }

      await createFlight(flightData)
      alert('Flight created successfully!')
      navigate('/staff/flights')
    } catch (err: any) {
      alert(err.message || 'Failed to create flight')
    }
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Create New Flight
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Flight Number"
                  name="flightNumber"
                  value={formData.flightNumber}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Departure Airport"
                  name="depAirport"
                  value={formData.depAirport}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Arrival Airport"
                  name="arrAirport"
                  value={formData.arrAirport}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Departure DateTime"
                  name="depDatetime"
                  value={formData.depDatetime}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Arrival DateTime"
                  name="arrDatetime"
                  value={formData.arrDatetime}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth type="number" label="Base Price" name="basePrice" value={formData.basePrice} onChange={handleChange} required />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Airplane ID" name="airplaneId" value={formData.airplaneId} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select name="status" value={formData.status} onChange={handleChange} label="Status">
                    <MenuItem value="on-time">On Time</MenuItem>
                    <MenuItem value="delayed">Delayed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth variant="contained" color="primary" type="submit">
                  Create Flight
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </>
  )
}
