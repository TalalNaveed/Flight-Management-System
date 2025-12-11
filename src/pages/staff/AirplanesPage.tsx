import { Container, Paper, TextField, Button, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent, Box } from '@mui/material'
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { addAirplane, getAirplanes } from '../../services/mockApi'

export default function AirplanesPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    airplaneId: '',
    numberOfSeats: '',
    manufacturer: '',
    age: '',
  })
  const [airplanes, setAirplanes] = useState<any[]>([])

  const loadAirplanes = async () => {
    if (!user?.username) return

    try {
      const data = await getAirplanes()
      setAirplanes(data.airplanes || [])
    } catch (err) {
      console.error('Failed to load airplanes', err)
    }
  }

  useEffect(() => {
    loadAirplanes()
  }, [user])

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAddAirplane = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.username) {
      alert('Please log in')
      return
    }

    try {
      const data = await addAirplane(formData)
      setAirplanes(data.airplanes || [])
      setFormData({ airplaneId: '', numberOfSeats: '', manufacturer: '', age: '' })
      alert('Airplane added successfully!')
    } catch (err: any) {
      alert(err.message || 'Failed to add airplane')
    }
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
          Manage Airplanes
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Add New Airplane
              </Typography>
              <form onSubmit={handleAddAirplane}>
                <TextField
                  fullWidth
                  label="Airplane ID"
                  name="airplaneId"
                  value={formData.airplaneId}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Number of Seats"
                  name="numberOfSeats"
                  value={formData.numberOfSeats}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Age (years)"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <Button fullWidth variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
                  Add Airplane
                </Button>
              </form>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Airplane ID</TableCell>
                    <TableCell>Seats</TableCell>
                    <TableCell>Manufacturer</TableCell>
                    <TableCell>Age</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {airplanes.map((plane) => (
                    <TableRow key={plane.id}>
                      <TableCell>{plane.id}</TableCell>
                      <TableCell>{plane.numberOfSeats}</TableCell>
                      <TableCell>{plane.manufacturer}</TableCell>
                      <TableCell>{plane.age} years</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}
