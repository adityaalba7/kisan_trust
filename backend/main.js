import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js";
import authroutes from "./routes/authroutes.js";
import fieldroutes from "./routes/fieldroutes.js";
import uploadImage from "./routes/uploadImage.js";
import diagnosisroutes from "./routes/diagnosisroutes.js";
import scoreroutes from "./routes/scoreroutes.js";
import lenderroutes from "./routes/lenderroutes.js";
import chatroutes from "./routes/chatroutes.js";
import loanroutes from "./routes/loanroutes.js";
import Message from "./models/message_model.js";

connectDB();
const app = express();

app.use(cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT;

// --- REST Routes ---
app.use("/api/auth", authroutes);
app.use("/api/fields", fieldroutes);
app.use("/api/upload", uploadImage);
app.use("/api/diagnosis", diagnosisroutes);
app.use("/api/score", scoreroutes);
app.use("/api/lenders", lenderroutes);
app.use("/api/chat", chatroutes);
app.use("/api/loans", loanroutes);

app.get("/", (req, res) => {
    res.json({ message: "KisanTrust Backend Is running" });
});

// --- HTTP + Socket.IO Server ---
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: (origin, callback) => callback(null, true),
        credentials: true,
    },
});

// Socket.IO auth middleware — verify JWT on connection
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userRole = decoded.role || "farmer"; // farmer tokens don't have role
        next();
    } catch {
        next(new Error("Invalid token"));
    }
});

// Track online users
const onlineUsers = new Map(); // id -> socketId

io.on("connection", (socket) => {
    const { userId, userRole } = socket;
    const roomId = `${userRole}_${userId}`;
    
    // Join personal room
    socket.join(roomId);
    onlineUsers.set(userId, socket.id);
    console.log(`🟢 ${userRole} ${userId} connected (${roomId})`);

    // --- Send Message ---
    socket.on("send_message", async (data) => {
        try {
            const { partnerId, partnerRole, text, senderName } = data;
            if (!partnerId || !text?.trim()) return;

            // Build conversation key
            let convKey;
            if (userRole === "farmer") {
                convKey = `farmer_${userId}_lender_${partnerId}`;
            } else {
                convKey = `farmer_${partnerId}_lender_${userId}`;
            }

            // Save to DB
            const message = await Message.create({
                conversation: convKey,
                sender: { id: userId, role: userRole, name: senderName || userRole },
                text: text.trim(),
            });

            const messageData = message.toObject();

            // Emit to partner's room
            const partnerRoom = `${partnerRole || (userRole === "farmer" ? "lender" : "farmer")}_${partnerId}`;
            io.to(partnerRoom).emit("receive_message", messageData);

            // Emit back to sender for confirmation
            socket.emit("message_sent", messageData);
        } catch (err) {
            console.error("send_message error:", err.message);
            socket.emit("message_error", { error: err.message });
        }
    });

    // --- Typing Indicator ---
    socket.on("typing", (data) => {
        const { partnerId, partnerRole } = data;
        const partnerRoom = `${partnerRole}_${partnerId}`;
        io.to(partnerRoom).emit("partner_typing", { userId, userRole });
    });

    socket.on("stop_typing", (data) => {
        const { partnerId, partnerRole } = data;
        const partnerRoom = `${partnerRole}_${partnerId}`;
        io.to(partnerRoom).emit("partner_stop_typing", { userId, userRole });
    });

    // --- Read Receipt ---
    socket.on("mark_read", async (data) => {
        try {
            const { conversationId } = data;
            await Message.updateMany(
                { conversation: conversationId, "sender.role": { $ne: userRole }, read: false },
                { $set: { read: true } }
            );
            // Notify the other side
            io.to(conversationId).emit("messages_read", { conversationId, readBy: userRole });
        } catch (err) {
            console.error("mark_read error:", err.message);
        }
    });

    // --- Disconnect ---
    socket.on("disconnect", () => {
        onlineUsers.delete(userId);
        console.log(`🔴 ${userRole} ${userId} disconnected`);
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/`);
    console.log(`Socket.IO ready for real-time chat 🚀`);
});