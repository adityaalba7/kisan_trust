import LoanApplication from "../models/loanApplication_model.js";
import Farmer from "../models/farmer_model.js";
import Diagnosis from "../models/diagnosis_model.js";
import { sendLoanNotification } from "../utils/smsService.js";

/**
 * POST /api/loans/apply (farmer auth)
 * Farmer submits a loan application publicly.
 */
export const applyForLoan = async (req, res) => {
    try {
        const farmerId = req.farmerID;
        const { amountRequested, purpose, description, cropType } = req.body;

        if (!amountRequested || !purpose) {
            return res.status(400).json({ message: "Amount and purpose are required" });
        }

        const farmer = await Farmer.findById(farmerId);
        if (!farmer) {
            return res.status(404).json({ message: "Farmer not found" });
        }

        // Check for existing pending application
        const existing = await LoanApplication.findOne({ farmer: farmerId, status: "pending" });
        if (existing) {
            return res.status(400).json({ message: "You already have a pending application" });
        }

        const application = await LoanApplication.create({
            farmer: farmerId,
            amountRequested,
            purpose,
            description: description || "",
            cropType: cropType || (farmer.cropTypes?.[0] || ""),
            agriScoreAtTime: farmer.agriTrustScore,
        });

        return res.status(201).json({
            message: "Loan application submitted successfully!",
            application,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * GET /api/loans/my-applications (farmer auth)
 * Farmer sees their own loan applications.
 */
export const getMyApplications = async (req, res) => {
    try {
        const applications = await LoanApplication.find({ farmer: req.farmerID })
            .populate("lender", "organizationName contactPerson")
            .sort({ createdAt: -1 });

        return res.json({ applications });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * GET /api/loans/leaderboard (lender auth)
 * Lender sees ALL pending loan applications ranked by Agri-Trust Score.
 */
export const getLoanLeaderboard = async (req, res) => {
    try {
        const applications = await LoanApplication.find({ status: { $in: ["pending", "under_review"] } })
            .populate("farmer", "name phone village state landsize cropTypes agriTrustScore createdAt")
            .sort({ agriScoreAtTime: -1 });

        // Enrich with diagnosis stats
        const enriched = await Promise.all(
            applications.map(async (app) => {
                const farmerId = app.farmer?._id;
                if (!farmerId) return app.toObject();

                const totalDiagnoses = await Diagnosis.countDocuments({ farmer: farmerId });
                const verifiedUploads = await Diagnosis.countDocuments({ farmer: farmerId, isVerified: true });

                return {
                    ...app.toObject(),
                    stats: {
                        totalDiagnoses,
                        verifiedUploads,
                        verificationRate: totalDiagnoses > 0 ? Math.round((verifiedUploads / totalDiagnoses) * 100) : 0,
                    },
                };
            })
        );

        return res.json({ applications: enriched });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * PUT /api/loans/:id/review (lender auth)
 * Lender approves/rejects a loan application.
 */
export const reviewApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, lenderNote } = req.body;
        const lenderId = req.lenderID;

        if (!["approved", "rejected", "under_review"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const application = await LoanApplication.findById(id);
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        application.status = status;
        application.lender = lenderId;
        if (lenderNote) application.lenderNote = lenderNote;
        await application.save();

        // --- Send SMS notification to farmer ---
        if (status === "approved" || status === "rejected") {
            const farmer = await Farmer.findById(application.farmer);
            if (farmer) {
                sendLoanNotification(farmer.phone, farmer.name, status, application.amountRequested)
                    .catch(err => console.error("Loan SMS error:", err.message));
            }
        }

        return res.json({
            message: `Application ${status}`,
            application,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
