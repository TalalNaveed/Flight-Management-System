import { Router } from 'express'
import * as flightsController from '../controllers/flights.controller'

const router = Router()

router.get('/', flightsController.searchFlights)
router.get('/:flightId/ratings', flightsController.getFlightRatings)

export default router

