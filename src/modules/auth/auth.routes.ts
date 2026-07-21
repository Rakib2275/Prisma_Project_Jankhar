import { Router } from "express";
import { authController } from "./auth.controller";

const router: Router = Router();

router.post("/login",authController.loginUser);
router.post("/refresh-token",authController.refreshToken);


export const authRouters = router;