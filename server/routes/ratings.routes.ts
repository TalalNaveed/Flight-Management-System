import { Router } from 'express'
import * as ratingsController from '../controllers/ratings.controller'
import { requireCustomer } from '../middleware/auth.middleware'

const router = Router()

router.get('/customer', requireCustomer, ratingsController.getCustomerRatings)
router.post('/', requireCustomer, ratingsController.submitRating)

export default router

