import { Router } from 'express'
import * as authController from '../controllers/auth.controller'

const router = Router()

router.post('/login', authController.login)
router.post('/logout', authController.logout)
router.get('/session', authController.checkSession) // Check current session status
router.post('/register/customer', authController.registerCustomer)
router.post('/register/staff', authController.registerStaff)

export default router

