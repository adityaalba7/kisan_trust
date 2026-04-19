import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversation: {
        type: String,
        required: true,
        index: true,
    },
    sender: {
        id: { type: mongoose.Schema.Types.ObjectId, required: true },
        role: { type: String, enum: ["farmer", "lender"], required: true },
        name: { type: String, required: true },
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Index for efficient conversation queries
messageSchema.index({ conversation: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);
