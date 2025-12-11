import { Box, Container, Paper, TextField, Button, Typography, Alert, ToggleButton, ToggleButtonGroup, Grid, CircularProgress, IconButton } from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { useState, useEffect } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'

const emailRegex = /^\S+@\S+\.\S+$/
const phoneRegex = /^[\d\s()+-]{7,30}$/

function isAdult(dob: string) {
  const birthDate = new Date(dob)
  if (isNaN(birthDate.getTime())) return false
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age >= 18
}

export default function RegisterPage() {
  const [userType, setUserType] = useState<'customer' | 'staff'>('customer')
  const [formData, setFormData] = useState<any>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { register, isLoading, error } = useAuth()
  const navigate = useNavigate()

  // Initialize phoneNumbers array when userType is staff
  useEffect(() => {
    if (userType === 'staff') {
      setFormData((prev: any) => {
        if (!prev.phoneNumbers || prev.phoneNumbers.length === 0) {
          return { ...prev, phoneNumbers: [''] }
        }
        return prev
      })
    }
  }, [userType])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (userType === 'customer') {
      if (!formData.fullName) newErrors.fullName = 'Full name is required'
      if (!formData.email) newErrors.email = 'Email is required'
      else if (!emailRegex.test(formData.email)) newErrors.email = 'Email is invalid'
      if (!formData.password || formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
      if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required'
      else if (!phoneRegex.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Phone number format is invalid'
      }
      if (!formData.buildingNumber) newErrors.buildingNumber = 'Building number is required'
      if (!formData.street) newErrors.street = 'Street is required'
      if (!formData.city) newErrors.city = 'City is required'
      if (!formData.state) newErrors.state = 'State is required'
      if (!formData.passportNumber) newErrors.passportNumber = 'Passport number is required'
      if (!formData.passportCountry) newErrors.passportCountry = 'Passport country is required'
      if (!formData.passportExpiration) newErrors.passportExpiration = 'Passport expiration is required'
      else if (new Date(formData.passportExpiration) <= new Date()) {
        newErrors.passportExpiration = 'Passport expiration must be in the future'
      }
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
      else if (!isAdult(formData.dateOfBirth)) {
        newErrors.dateOfBirth = 'You must be at least 18 years old'
      }
    } else {
      if (!formData.username) newErrors.username = 'Username is required'
      if (!formData.email) newErrors.email = 'Email is required'
      else if (!emailRegex.test(formData.email)) newErrors.email = 'Email is invalid'
      if (!formData.password || formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
      if (!formData.firstName) newErrors.firstName = 'First name is required'
      if (!formData.lastName) newErrors.lastName = 'Last name is required'
      if (!formData.airlineName) newErrors.airlineName = 'Airline name is required'
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required'
      } else if (!isAdult(formData.dateOfBirth)) {
        newErrors.dateOfBirth = 'Staff must be at least 18 years old'
      }
      // Validate phone numbers array
      if (!formData.phoneNumbers || !Array.isArray(formData.phoneNumbers) || formData.phoneNumbers.length === 0) {
        newErrors.phoneNumbers = 'At least one phone number is required'
      } else {
        formData.phoneNumbers.forEach((phone: string, index: number) => {
          if (!phone || !phone.trim()) {
            newErrors[`phoneNumbers[${index}]`] = 'Phone number cannot be empty'
          } else if (!phoneRegex.test(phone)) {
            newErrors[`phoneNumbers[${index}]`] = 'Phone number format is invalid'
          }
        })
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handlePhoneNumberChange = (index: number, value: string) => {
    setFormData((prev: any) => {
      const phoneNumbers = [...(prev.phoneNumbers || [])]
      phoneNumbers[index] = value
      return { ...prev, phoneNumbers }
    })
    // Clear error for this field
    if (errors[`phoneNumbers[${index}]`]) {
      setErrors((prev: any) => {
        const newErrors = { ...prev }
        delete newErrors[`phoneNumbers[${index}]`]
        return newErrors
      })
    }
  }

  const addPhoneNumber = () => {
    setFormData((prev: any) => ({
      ...prev,
      phoneNumbers: [...(prev.phoneNumbers || []), '']
    }))
  }

  const removePhoneNumber = (index: number) => {
    setFormData((prev: any) => {
      const phoneNumbers = [...(prev.phoneNumbers || [])]
      phoneNumbers.splice(index, 1)
      return { ...prev, phoneNumbers }
    })
    // Clear error for this field
    setErrors((prev: any) => {
      const newErrors = { ...prev }
      delete newErrors[`phoneNumbers[${index}]`]
      return newErrors
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      try {
        // For staff, ensure phoneNumbers is sent as array
        const submitData = { ...formData }
        if (userType === 'staff') {
          // Filter out empty phone numbers before submitting
          submitData.phoneNumbers = (formData.phoneNumbers || []).filter((pn: string) => pn && pn.trim())
        }
        await register(submitData, userType)
        navigate(userType === 'customer' ? '/customer/dashboard' : '/staff/dashboard')
      } catch (err) {
        // Error is handled by context
      }
    }
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 600, textAlign: 'center' }}>
            Register with AirBook
          </Typography>

          <ToggleButtonGroup
            value={userType}
            exclusive
            onChange={(e, newType) => {
              if (newType) {
                setUserType(newType)
                // Initialize phoneNumbers array when switching to staff
                if (newType === 'staff' && !formData.phoneNumbers) {
                  setFormData((prev: any) => ({ ...prev, phoneNumbers: [''] }))
                }
              }
            }}
            fullWidth
            sx={{ mb: 3 }}
          >
            <ToggleButton value="customer">Customer</ToggleButton>
            <ToggleButton value="staff">Airline Staff</ToggleButton>
          </ToggleButtonGroup>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {userType === 'customer' ? (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name *"
                      name="fullName"
                      value={formData.fullName || ''}
                      onChange={handleChange}
                      error={!!errors.fullName}
                      helperText={errors.fullName}
                      InputLabelProps={{ required: false }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email *"
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      InputLabelProps={{ required: false }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Password *"
                      type="password"
                      name="password"
                      value={formData.password || ''}
                      onChange={handleChange}
                      error={!!errors.password}
                      helperText={errors.password}
                      InputLabelProps={{ required: false }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number *"
                      name="phoneNumber"
                      value={formData.phoneNumber || ''}
                      onChange={handleChange}
                      error={!!errors.phoneNumber}
                      helperText={errors.phoneNumber}
                      InputLabelProps={{ required: false }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Building Number *"
                      name="buildingNumber"
                      value={formData.buildingNumber || ''}
                      onChange={handleChange}
                      error={!!errors.buildingNumber}
                      helperText={errors.buildingNumber}
                      InputLabelProps={{ required: false }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Street *"
                      name="street"
                      value={formData.street || ''}
                      onChange={handleChange}
                      error={!!errors.street}
                      helperText={errors.street}
                      InputLabelProps={{ required: false }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="City *"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleChange}
                      error={!!errors.city}
                      helperText={errors.city}
                      InputLabelProps={{ required: false }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="State *"
                      name="state"
                      value={formData.state || ''}
                      onChange={handleChange}
                      error={!!errors.state}
                      helperText={errors.state}
                      InputLabelProps={{ required: false }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Passport Number *"
                      name="passportNumber"
                      value={formData.passportNumber || ''}
                      onChange={handleChange}
                      error={!!errors.passportNumber}
                      helperText={errors.passportNumber}
                      InputLabelProps={{ required: false }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Passport Country *"
                      name="passportCountry"
                      value={formData.passportCountry || ''}
                      onChange={handleChange}
                      error={!!errors.passportCountry}
                      helperText={errors.passportCountry}
                      InputLabelProps={{ required: false }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Passport Expiration *"
                      type="date"
                      name="passportExpiration"
                      value={formData.passportExpiration || ''}
                      onChange={handleChange}
                      error={!!errors.passportExpiration}
                      helperText={errors.passportExpiration}
                      InputLabelProps={{ shrink: true, required: false }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Date of Birth *"
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth || ''}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true, required: false }}
                      error={!!errors.dateOfBirth}
                      helperText={errors.dateOfBirth}
                    />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name *"
                      name="firstName"
                      value={formData.firstName || ''}
                      onChange={handleChange}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                      InputLabelProps={{ required: false }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name *"
                      name="lastName"
                      value={formData.lastName || ''}
                      onChange={handleChange}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                      InputLabelProps={{ required: false }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Username *"
                      name="username"
                      value={formData.username || ''}
                      onChange={handleChange}
                      error={!!errors.username}
                      helperText={errors.username}
                      InputLabelProps={{ required: false }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email *"
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      InputLabelProps={{ required: false }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Password *"
                      type="password"
                      name="password"
                      value={formData.password || ''}
                      onChange={handleChange}
                      error={!!errors.password}
                      helperText={errors.password}
                      InputLabelProps={{ required: false }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                      Phone Numbers *
                    </Typography>
                    {(formData.phoneNumbers || ['']).map((phone: string, index: number) => (
                      <Grid container spacing={1} key={index} sx={{ mb: 1 }}>
                        <Grid item xs>
                          <TextField
                            fullWidth
                            label={`Phone Number ${index + 1}`}
                            value={phone || ''}
                            onChange={(e) => handlePhoneNumberChange(index, e.target.value)}
                            error={!!errors[`phoneNumbers[${index}]`] || (index === 0 && !!errors.phoneNumbers)}
                            helperText={errors[`phoneNumbers[${index}]`] || (index === 0 && errors.phoneNumbers)}
                            InputLabelProps={{ required: false }}
                          />
                        </Grid>
                        {(formData.phoneNumbers || []).length > 1 && (
                          <Grid item xs="auto">
                            <IconButton
                              onClick={() => removePhoneNumber(index)}
                              color="error"
                              sx={{ mt: 1 }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        )}
                      </Grid>
                    ))}
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addPhoneNumber}
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      Add Phone Number
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Date of Birth *"
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth || ''}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true, required: false }}
                      error={!!errors.dateOfBirth}
                      helperText={errors.dateOfBirth}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Airline Name *"
                      name="airlineName"
                      value={formData.airlineName || ''}
                      onChange={handleChange}
                      error={!!errors.airlineName}
                      helperText={errors.airlineName}
                      InputLabelProps={{ required: false }}
                    />
                  </Grid>
                </>
              )}
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
              {isLoading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
          </form>

          <Typography sx={{ mt: 2, textAlign: 'center' }}>
            Already have an account? <RouterLink to="/login">Login here</RouterLink>
          </Typography>
        </Paper>
      </Container>
    </>
  )
}
