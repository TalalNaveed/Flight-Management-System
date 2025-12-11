import { Router } from 'express'
import * as reportsController from '../controllers/reports.controller'
import { requireStaff } from '../middleware/auth.middleware'

const router = Router()

router.get('/sales', requireStaff, reportsController.getSalesReports)

export default router

