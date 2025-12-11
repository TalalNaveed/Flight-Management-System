import { Request, Response } from 'express'
import { hashPassword, generateToken } from '../utils/auth.utils'
import { db } from "../config/db";

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body
    const hashedPassword = hashPassword(password)

    // Check customer
    const [customerRows] = await db.query<any[]>(
      'SELECT * FROM Customer WHERE Email = ? AND Customer_Password = ?',
      [username, hashedPassword]
    )

    if (customerRows.length > 0) {
      const customer = customerRows[0]
      
      // Create session
      req.session.user = {
        pid: customer.Email, // User identifier (email for customers)
        role: 'customer',
        email: customer.Email,
      }
      
      console.log('='.repeat(60))
      console.log('✅ SESSION CREATED - Customer Login')
      console.log('='.repeat(60))
      console.log('Session ID:', req.sessionID)
      console.log('User PID:', req.session.user.pid)
      console.log('User Role:', req.session.user.role)
      console.log('User Email:', req.session.user.email)
      console.log('Session Cookie:', req.headers.cookie)
      console.log('='.repeat(60))
      
      // Explicitly save session to ensure cookie is set
      req.session.save((err) => {
        if (err) {
          console.error('❌ SESSION SAVE ERROR:', err)
          return res.status(500).json({ error: 'Failed to create session' })
        }
        console.log('✅ Session saved successfully')
        res.json({
          token: generateToken('cust'),
          role: 'customer',
          email: customer.Email,
          username: customer.Email,
        })
      })
      return
    }

    // Check staff
    const [staffRows] = await db.query<any[]>(
      'SELECT * FROM Airline_Staff WHERE Username = ? AND Staff_Password = ?',
      [username, hashedPassword]
    )

    if (staffRows.length > 0) {
      const staff = staffRows[0]
      
      // Create session
      req.session.user = {
        pid: staff.Username, // User identifier (username for staff)
        role: 'staff',
        username: staff.Username,
        airlineName: staff.Airline_Name,
      }
      
      console.log('='.repeat(60))
      console.log('✅ SESSION CREATED - Staff Login')
      console.log('='.repeat(60))
      console.log('Session ID:', req.sessionID)
      console.log('User PID:', req.session.user.pid)
      console.log('User Role:', req.session.user.role)
      console.log('Username:', req.session.user.username)
      console.log('Airline Name:', req.session.user.airlineName)
      console.log('Session Cookie:', req.headers.cookie)
      console.log('='.repeat(60))
      
      // Explicitly save session to ensure cookie is set
      req.session.save((err) => {
        if (err) {
          console.error('❌ SESSION SAVE ERROR:', err)
          return res.status(500).json({ error: 'Failed to create session' })
        }
        console.log('✅ Session saved successfully')
        res.json({
          token: generateToken('staff'),
          role: 'staff',
          username: staff.Username,
          airlineName: staff.Airline_Name,
        })
      })
      return
    }

    return res.status(401).json({ error: 'Invalid credentials' })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}

export const registerCustomer = async (req: Request, res: Response) => {
  try {
    const data = req.body

    const validationError = (field: string, message: string) =>
      res.status(400).json({ field, error: message })

    // Validate ALL required fields
    if (!data.email || typeof data.email !== 'string' || !data.email.trim()) {
      return validationError('email', 'Email is required')
    }
    if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) {
      return validationError('email', 'Email is invalid')
    }
    if (!data.password || typeof data.password !== 'string' || data.password.length < 6) {
      return validationError('password', 'Password is required and must be at least 6 characters')
    }
    if (!data.fullName || typeof data.fullName !== 'string' || !data.fullName.trim()) {
      return validationError('fullName', 'Full name is required')
    }
    if (!data.phoneNumber || typeof data.phoneNumber !== 'string' || !data.phoneNumber.trim()) {
      return validationError('phoneNumber', 'Phone number is required')
    }
    if (!/^[\d\s()+-]{7,30}$/.test(data.phoneNumber.trim())) {
      return validationError('phoneNumber', 'Phone number format is invalid')
    }
    if (!data.buildingNumber || typeof data.buildingNumber !== 'string' || !data.buildingNumber.trim()) {
      return validationError('buildingNumber', 'Building number is required')
    }
    if (!data.street || typeof data.street !== 'string' || !data.street.trim()) {
      return validationError('street', 'Street is required')
    }
    if (!data.city || typeof data.city !== 'string' || !data.city.trim()) {
      return validationError('city', 'City is required')
    }
    if (!data.state || typeof data.state !== 'string' || !data.state.trim()) {
      return validationError('state', 'State is required')
    }
    if (!data.passportNumber || typeof data.passportNumber !== 'string' || !data.passportNumber.trim()) {
      return validationError('passportNumber', 'Passport number is required')
    }
    if (!data.passportCountry || typeof data.passportCountry !== 'string' || !data.passportCountry.trim()) {
      return validationError('passportCountry', 'Passport country is required')
    }
    if (!data.passportExpiration || typeof data.passportExpiration !== 'string' || !data.passportExpiration.trim()) {
      return validationError('passportExpiration', 'Passport expiration date is required')
    }
    if (!data.dateOfBirth || typeof data.dateOfBirth !== 'string' || !data.dateOfBirth.trim()) {
      return validationError('dateOfBirth', 'Date of birth is required')
    }

    // Validate date formats
    const dobDate = new Date(data.dateOfBirth)
    if (isNaN(dobDate.getTime())) {
      return validationError('dateOfBirth', 'Date of birth is invalid')
    }
    const passportExpDate = new Date(data.passportExpiration)
    if (isNaN(passportExpDate.getTime())) {
      return validationError('passportExpiration', 'Passport expiration date is invalid')
    }
    if (passportExpDate <= new Date()) {
      return validationError('passportExpiration', 'Passport expiration date must be in the future')
    }

    // Check if email already exists
    const [existingEmail] = await db.query<any[]>(
      'SELECT * FROM Customer WHERE Email = ?',
      [data.email.trim()]
    )

    if (existingEmail.length > 0) {
      return validationError('email', 'Email already registered')
    }

    // Check if phone number already exists
    const [existingPhone] = await db.query<any[]>(
      'SELECT * FROM Customer WHERE Phone_num = ?',
      [data.phoneNumber.trim()]
    )

    if (existingPhone.length > 0) {
      return validationError('phoneNumber', 'Phone number already registered')
    }

    const token = generateToken('cust')
    const hashedPassword = hashPassword(data.password.trim())

    // Insert customer - matching actual schema
    await db.query(
      `INSERT INTO Customer 
       (Email, Customer_Password, Name, Phone_num, Building_num, Street, City, State, Passport_num, Passport_country, Passport_expiry, Date_of_birth)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.email.trim(),
        hashedPassword,
        data.fullName.trim(),
        data.phoneNumber.trim(),
        data.buildingNumber.trim(),
        data.street.trim(),
        data.city.trim(),
        data.state.trim(),
        data.passportNumber.trim(),
        data.passportCountry.trim(),
        data.passportExpiration.trim(),
        data.dateOfBirth.trim()
      ]
    )

    return res.json({
      token,
      role: 'customer',
      email: data.email,
      username: data.email,
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}

export const logout = async (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionID
    const userInfo = req.session?.user
    
    console.log('='.repeat(60))
    console.log('🔴 SESSION DESTROY - Logout Request')
    console.log('='.repeat(60))
    console.log('Session ID:', sessionId)
    if (userInfo) {
      console.log('User PID:', userInfo.pid)
      console.log('User Role:', userInfo.role)
    } else {
      console.log('⚠️  No user data in session (may already be destroyed)')
    }
    console.log('='.repeat(60))
    
    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ SESSION DESTROY ERROR:', err)
        return res.status(500).json({ error: 'Failed to destroy session' })
      }
      // Clear session cookie
      res.clearCookie('connect.sid')
      console.log('✅ Session destroyed successfully')
      console.log('✅ Session cookie cleared')
      return res.json({ message: 'Logged out successfully' })
    })
  } catch (err: any) {
    console.error('❌ LOGOUT ERROR:', err)
    return res.status(500).json({ error: err.message })
  }
}

// Check current session status
export const checkSession = async (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionID
    const hasSession = !!req.session
    const hasUser = !!req.session?.user
    
    console.log('='.repeat(60))
    console.log('🔍 SESSION CHECK')
    console.log('='.repeat(60))
    console.log('Session ID:', sessionId)
    console.log('Session exists:', hasSession)
    console.log('User in session:', hasUser)
    if (req.session?.user) {
      console.log('User PID:', req.session.user.pid)
      console.log('User Role:', req.session.user.role)
      console.log('Full user data:', req.session.user)
    }
    console.log('Cookies:', req.headers.cookie)
    console.log('='.repeat(60))
    
    if (!hasSession || !hasUser) {
      return res.status(401).json({
        authenticated: false,
        message: 'No active session found',
        sessionId,
      })
    }
    
    return res.json({
      authenticated: true,
      sessionId,
      user: req.session.user,
    })
  } catch (err: any) {
    console.error('❌ SESSION CHECK ERROR:', err)
    return res.status(500).json({ error: err.message })
  }
}

const emailRegex = /^\S+@\S+\.\S+$/
const phoneRegex = /^[\d\s()+-]{7,30}$/

export const registerStaff = async (req: Request, res: Response) => {
  try {
    const data = req.body

    const sanitize = (value: any) => (typeof value === 'string' ? value.trim() : '')
    const username = sanitize(data.username)
    const email = sanitize(data.email)
    const firstName = sanitize(data.firstName)
    const lastName = sanitize(data.lastName)
    const airlineName = sanitize(data.airlineName)
    const password = sanitize(data.password)
    const dateOfBirth = sanitize(data.dateOfBirth)
    
    // Handle phone numbers - can be single string or array
    let phoneNumbers: string[] = []
    if (Array.isArray(data.phoneNumbers)) {
      phoneNumbers = data.phoneNumbers.map((pn: any) => sanitize(pn)).filter((pn: string) => pn)
    } else if (data.phoneNumber) {
      // Backward compatibility: if single phoneNumber is provided, convert to array
      phoneNumbers = [sanitize(data.phoneNumber)]
    } else if (data.phoneNumbers) {
      // Handle case where phoneNumbers is a single string
      phoneNumbers = [sanitize(data.phoneNumbers)]
    }

    const validationError = (field: string, message: string) =>
      res.status(400).json({ field, error: message })

    if (!airlineName) {
      return validationError('airlineName', 'Airline name is required')
    }
    if (!username) {
      return validationError('username', 'Username is required')
    }
    if (!email) {
      return validationError('email', 'Email is required')
    }
    if (!emailRegex.test(email)) {
      return validationError('email', 'Email is invalid')
    }
    if (!password || password.length < 6) {
      return validationError('password', 'Password must be at least 6 characters')
    }
    if (!firstName) {
      return validationError('firstName', 'First name is required')
    }
    if (!lastName) {
      return validationError('lastName', 'Last name is required')
    }
    if (!dateOfBirth) {
      return validationError('dateOfBirth', 'Date of birth is required')
    }
    const dobDate = new Date(dateOfBirth)
    if (isNaN(dobDate.getTime())) {
      return validationError('dateOfBirth', 'Date of birth is invalid')
    }
    const today = new Date()
    let age = today.getFullYear() - dobDate.getFullYear()
    const monthDiff = today.getMonth() - dobDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      age--
    }
    if (age < 18) {
      return validationError('dateOfBirth', 'Staff must be at least 18 years old')
    }
    // At least one phone number is required for staff
    if (phoneNumbers.length === 0) {
      return validationError('phoneNumbers', 'At least one phone number is required')
    }
    // Validate each phone number
    for (let i = 0; i < phoneNumbers.length; i++) {
      const phoneNumber = phoneNumbers[i]
      if (!phoneRegex.test(phoneNumber)) {
        return validationError(`phoneNumbers[${i}]`, 'Phone number format is invalid. Use digits, spaces, +, -, or parentheses only')
      }
    }

    // Check if username already exists in Airline_Staff table
    const [existingUsername] = await db.query<any[]>(
      'SELECT * FROM Airline_Staff WHERE Username = ?',
      [username]
    )

    if (existingUsername.length > 0) {
      return validationError('username', 'Username already exists. Please choose a different username.')
    }

    const [existingEmail] = await db.query<any[]>(
      'SELECT * FROM Airline_Staff WHERE Email = ?',
      [email]
    )

    if (existingEmail.length > 0) {
      return validationError('email', 'Email already exists. Please use a different email.')
    }

    const token = generateToken('staff')
    const hashedPassword = hashPassword(password)

    // Insert staff - matching actual schema (no Token, no Phone_number in main table)
    await db.query(
      `INSERT INTO Airline_Staff 
       (Username, Staff_Password, First_name, Last_name, Email, Date_of_birth, Airline_Name)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        username,
        hashedPassword,
        firstName,
        lastName,
        email,
        dateOfBirth,
        airlineName
      ]
    )

    // Insert all phone numbers into separate table
    for (const phoneNumber of phoneNumbers) {
      await db.query(
        `INSERT INTO Staff_Phone (Username, Phone_num) VALUES (?, ?)`,
        [username, phoneNumber]
      )
    }

    return res.json({
      token,
      role: 'staff',
      username,
      airlineName,
    })
  } catch (err: any) {
    // Handle duplicate username error from database (in case check above didn't catch it)
    if (err.code === 'ER_DUP_ENTRY' || err.message.includes('Duplicate entry')) {
      return res.status(400).json({ error: 'Username already exists. Please choose a different username.' })
    }
    return res.status(500).json({ error: err.message })
  }
}

