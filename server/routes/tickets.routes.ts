import { Router } from "express";
import * as ticketsController from "../controllers/tickets.controller";
import { requireCustomer } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireCustomer, ticketsController.getCustomerTickets);
router.post("/purchase", requireCustomer, ticketsController.purchaseTicket);

export default router;
