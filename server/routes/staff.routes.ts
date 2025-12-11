import { Router } from "express";
import * as staffController from "../controllers/staff.controller";
import { requireStaff } from "../middleware/auth.middleware";

const router = Router();
router.get("/flights", requireStaff, staffController.getStaffFlights);
router.get("/flights/:flightId/passengers", requireStaff, staffController.getFlightPassengers);
router.post("/flights", requireStaff, staffController.createFlight);
router.patch("/flights/:flightId/status", requireStaff, staffController.changeFlightStatus);
router.get("/airplanes", requireStaff, staffController.getAirplanes);
router.post("/airplanes", requireStaff, staffController.addAirplane);

export default router;
