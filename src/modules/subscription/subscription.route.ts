import { Router } from "express";
import { subscriptionController } from "./subscription.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";


const router = Router()

router.post("/checkout",
    auth(Role.ADMIN,Role.USER),
    subscriptionController.createCheckoutSession)

export const subscriptionRoutes = router