import { Router } from "express";
import * as authController from "../controllers/authController";
import * as guestController from "../controllers/guestController";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware";

const router = Router();

// Authentication
router.post("/auth/login", authController.login);
router.post("/auth/register", authMiddleware, isAdmin, authController.register);

// Guests CRUD
router.get("/guests", authMiddleware, guestController.getGuests);
router.post("/guests", authMiddleware, guestController.createGuest);
router.put("/guests/:id", authMiddleware, guestController.updateGuest);
router.delete("/guests/:id", authMiddleware, guestController.deleteGuest);

// Quick deliver action (For field staff)
router.put("/guests/:id/status", authMiddleware, guestController.markAsDelivered);

// Dashboard & Analytics stats
router.get("/stats/dashboard", authMiddleware, guestController.getDashboardStats);
router.get("/stats/analytics", authMiddleware, guestController.getAnalytics);

// Bulk Import
router.post("/guests/import", authMiddleware, guestController.bulkImportGuests);

export default router;
