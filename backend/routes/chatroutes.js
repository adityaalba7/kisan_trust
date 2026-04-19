import express from "express";
import verifyToken from "../middleware/authmiddleware.js";
import verifyLenderToken from "../middleware/lenderAuth.js";
import { getConversations, getMessages, getUnreadCount } from "../controllers/chat_controller.js";

const router = express.Router();

/**
 * Combined auth middleware: accepts both farmer and lender tokens.
 * Sets req.farmerID or req.lenderID depending on who is calling.
 */
const verifyAnyToken = (req, res, next) => {
    // Try farmer auth first
    verifyToken(req, res, (err) => {
        if (!err && req.farmerID) return next();
        // Reset for lender attempt
        verifyLenderToken(req, res, next);
    });
};

// Chat routes (either farmer or lender)
router.get("/conversations", verifyAnyToken, getConversations);
router.get("/messages/:partnerId", verifyAnyToken, getMessages);
router.get("/unread", verifyAnyToken, getUnreadCount);

export default router;
