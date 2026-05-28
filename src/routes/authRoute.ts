import { Router } from "express";
import { RegisterController } from "../controllers/authController";

const router: Router = Router();

router.post("/register", RegisterController);

export default router;
