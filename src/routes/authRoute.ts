import { Router } from "express";
import {
  LoginController,
  RegisterController,
} from "../controllers/authController.js";

const router: Router = Router();

router.post("/register", RegisterController);
router.post("/login", LoginController);

export default router;
