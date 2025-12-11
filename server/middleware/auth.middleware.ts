import { Request, Response, NextFunction } from 'express'

// Extend Express Request to include session
declare module 'express-session' {
  interface SessionData {
    user?: {
      pid: string // user identifier (email for customers, username for staff)
      role: 'customer' | 'staff'
      email?: string
      username?: string
      airlineName?: string
    }
  }
}

// Middleware to check if user is authenticated
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log('🔐 requireAuth middleware - Checking authentication')
  console.log('Session ID:', req.sessionID)
  console.log('Session exists:', !!req.session)
  console.log('User in session:', !!req.session?.user)
  
  if (!req.session || !req.session.user) {
    console.log('❌ Authentication failed - No session or user')
    return res.status(401).json({ error: 'Unauthorized: Please log in' })
  }
  
  console.log('✅ Authentication passed - User PID:', req.session.user.pid)
  next()
}

// Middleware to check if user is a customer
export const requireCustomer = (req: Request, res: Response, next: NextFunction) => {
  console.log('='.repeat(60))
  console.log('🔐 requireCustomer middleware - Checking customer authorization')
  console.log('='.repeat(60))
  console.log('Session ID:', req.sessionID)
  console.log('Session exists:', !!req.session)
  console.log('User in session:', !!req.session?.user)
  if (req.session?.user) {
    console.log('User PID:', req.session.user.pid)
    console.log('User Role:', req.session.user.role)
  }
  console.log('Cookies:', req.headers.cookie)
  console.log('='.repeat(60))

  if (!req.session || !req.session.user) {
    console.log('❌ Authorization failed - No session or user found')
    return res.status(401).json({ error: 'Unauthorized: Please log in' })
  }
  if (req.session.user.role !== 'customer') {
    console.log('❌ Authorization failed - Wrong role:', req.session.user.role, '(expected: customer)')
    return res.status(403).json({ error: 'Forbidden: Customer access required' })
  }
  console.log('✅ Customer authorization passed - User PID:', req.session.user.pid)
  next()
}

// Middleware to check if user is staff
export const requireStaff = (req: Request, res: Response, next: NextFunction) => {
  console.log('='.repeat(60))
  console.log('🔐 requireStaff middleware - Checking staff authorization')
  console.log('='.repeat(60))
  console.log('Session ID:', req.sessionID)
  console.log('Session exists:', !!req.session)
  console.log('User in session:', !!req.session?.user)
  if (req.session?.user) {
    console.log('User PID:', req.session.user.pid)
    console.log('User Role:', req.session.user.role)
  }
  console.log('Cookies:', req.headers.cookie)
  console.log('='.repeat(60))
  
  if (!req.session || !req.session.user) {
    console.log('❌ Authorization failed - No session or user found')
    return res.status(401).json({ error: 'Unauthorized: Please log in' })
  }
  if (req.session.user.role !== 'staff') {
    console.log('❌ Authorization failed - Wrong role:', req.session.user.role, '(expected: staff)')
    return res.status(403).json({ error: 'Forbidden: Staff access required' })
  }
  console.log('✅ Staff authorization passed - User PID:', req.session.user.pid)
  next()
}

// Helper to get user from session
export const getSessionUser = (req: Request) => {
  return req.session?.user
}

