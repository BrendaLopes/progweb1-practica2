//src/routes/adminRoutes.js
import { Router } from "express";
import { authenticateJWT } from "../middleware/authenticateJWT.js";
import { listUsers, updateUserRole, deleteUser } from "../controllers/adminUsers.controller.js";

const router = Router();

router.get("/users", authenticateJWT("admin"), listUsers);
router.put("/users/:id/role", authenticateJWT("admin"), updateUserRole);
router.delete("/users/:id", authenticateJWT("admin"), deleteUser);

export default router;
