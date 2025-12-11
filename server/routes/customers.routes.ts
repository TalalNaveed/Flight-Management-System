import { Router } from 'express'
import * as ticketsController from '../controllers/tickets.controller'
import { requireCustomer } from '../middleware/auth.middleware'

const router = Router()

router.get('/tickets', requireCustomer, ticketsController.getCustomerTickets)

export default router

