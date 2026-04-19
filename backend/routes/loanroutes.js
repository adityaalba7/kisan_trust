import express from "express";
import verifyToken from "../middleware/authmiddleware.js";
import verifyLenderToken from "../middleware/lenderAuth.js";
import {
    applyForLoan,
    getMyApplications,
    getLoanLeaderboard,
    reviewApplication,
} from "../controllers/loan_controller.js";

const router = express.Router();

// Farmer routes (farmer JWT)
router.post("/apply", verifyToken, applyForLoan);
router.get("/my-applications", verifyToken, getMyApplications);

// Lender routes (lender JWT)
router.get("/leaderboard", verifyLenderToken, getLoanLeaderboard);
router.put("/:id/review", verifyLenderToken, reviewApplication);

export default router;
