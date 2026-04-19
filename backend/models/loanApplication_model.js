import mongoose from "mongoose";

const loanApplicationSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Farmer",
        required: true,
    },
    lender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lender",
        default: null,
    },
    amountRequested: {
        type: Number,
        required: true,
    },
    purpose: {
        type: String,
        enum: ["seeds", "fertilizer", "equipment", "irrigation", "livestock", "other"],
        required: true,
    },
    description: {
        type: String,
        default: "",
        trim: true,
    },
    cropType: {
        type: String,
        default: "",
    },
    agriScoreAtTime: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "under_review"],
        default: "pending",
    },
    lenderNote: {
        type: String,
        default: "",
    },
}, { timestamps: true });

export default mongoose.model("LoanApplication", loanApplicationSchema);

