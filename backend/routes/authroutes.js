import express from "express";
import { login, register, logout } from "../controllers/authController.js";
import verifyToken from "../middleware/authmiddleware.js";
import Farmer from "../models/farmer_model.js"

const router = express.Router()

router.post("/signup", register);

router.post("/login",login);

router.post("/logout", verifyToken, logout);

router.get("/me",verifyToken,async (req,res)=>{
    const farmer = await Farmer.findById(req.farmerID).select("-password")
    res.json(farmer)
})

export default router;