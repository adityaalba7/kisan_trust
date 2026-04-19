import Message from "../models/message_model.js";
import Farmer from "../models/farmer_model.js";
import Lender from "../models/lender_model.js";

/**
 * Helper: build conversation key (always sorted the same way)
 */
function conversationKey(farmerId, lenderId) {
    return `farmer_${farmerId}_lender_${lenderId}`;
}

/**
 * GET /api/chat/conversations
 * Lists all conversations for the current user (farmer or lender).
 */
export const getConversations = async (req, res) => {
    try {
        const userId = req.farmerID || req.lenderID;
        const role = req.farmerID ? "farmer" : "lender";
        const prefix = role === "farmer" ? `farmer_${userId}` : `lender_${userId}`;

        // Find all unique conversations involving this user
        const messages = await Message.aggregate([
            { $match: { conversation: { $regex: prefix } } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$conversation",
                    lastMessage: { $first: "$text" },
                    lastSender: { $first: "$sender" },
                    lastTime: { $first: "$createdAt" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ["$read", false] }, { $ne: ["$sender.role", role] }] },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
            { $sort: { lastTime: -1 } },
        ]);

        // Enrich with partner info
        const enriched = await Promise.all(
            messages.map(async (conv) => {
                // Parse conversation key: farmer_<id>_lender_<id>
                const parts = conv._id.match(/farmer_(.+)_lender_(.+)/);
                if (!parts) return null;
                const [, farmerId, lenderId] = parts;
                
                let partner;
                if (role === "farmer") {
                    const l = await Lender.findById(lenderId).select("organizationName contactPerson");
                    partner = l ? { id: l._id, name: l.organizationName, subtitle: l.contactPerson, role: "lender" } : null;
                } else {
                    const f = await Farmer.findById(farmerId).select("name phone village agriTrustScore");
                    partner = f ? { id: f._id, name: f.name, subtitle: `${f.village || ""} · Score: ${f.agriTrustScore}`, role: "farmer", phone: f.phone } : null;
                }

                return {
                    conversationId: conv._id,
                    partner,
                    lastMessage: conv.lastMessage,
                    lastSender: conv.lastSender,
                    lastTime: conv.lastTime,
                    unreadCount: conv.unreadCount,
                };
            })
        );

        return res.json({ conversations: enriched.filter(Boolean) });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * GET /api/chat/messages/:partnerId
 * Get messages between the current user and a partner.
 */
export const getMessages = async (req, res) => {
    try {
        const { partnerId } = req.params;
        const userId = req.farmerID || req.lenderID;
        const role = req.farmerID ? "farmer" : "lender";

        // Build conversation key
        let convKey;
        if (role === "farmer") {
            convKey = conversationKey(userId, partnerId);
        } else {
            convKey = conversationKey(partnerId, userId);
        }

        const messages = await Message.find({ conversation: convKey })
            .sort({ createdAt: 1 })
            .limit(200);

        // Mark unread messages from the other side as read
        await Message.updateMany(
            { conversation: convKey, "sender.role": { $ne: role }, read: false },
            { $set: { read: true } }
        );

        return res.json({ conversationId: convKey, messages });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * GET /api/chat/unread
 * Get total unread count for the current user.
 */
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.farmerID || req.lenderID;
        const role = req.farmerID ? "farmer" : "lender";
        const prefix = role === "farmer" ? `farmer_${userId}` : `lender_${userId}`;

        const count = await Message.countDocuments({
            conversation: { $regex: prefix },
            "sender.role": { $ne: role },
            read: false,
        });

        return res.json({ unread: count });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
