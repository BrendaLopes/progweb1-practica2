//src/routes/index.js
import { Router } from "express";
import authRoutes from "./authRoutes.js";
import productRoutes from "./productRoutes.js";
import chatRoutes from "./chatRoutes.js";
import adminRoutes from "./adminRoutes.js";

const router = Router();

router.get("/health", (_req, res) =>
  res.json({ ok: true, author: "Brenda Lopes", subject: "ProgWeb I" })
);

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/chat", chatRoutes);
router.use("/admin", adminRoutes);

export default router;
