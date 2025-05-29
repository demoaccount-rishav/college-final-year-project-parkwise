import RFID from "../models/rfidCard.model.js";
import User from "../models/user.model.js";

export const card_id_to_phoneNumber_and_cycleId = async (req, res, next) => {
    try {
        const { rfidCard } = req.body;

        if (!rfidCard) {
            return res.status(400).json({
                success: false,
                message: "RFID card ID is required"
            });
        }

        // Find the RFID card document first
        const rfidDocument = await RFID.findOne({ rfidCard });

        // Check if RFID card exists
        if (!rfidDocument) {
            return res.status(404).json({
                success: false,
                message: "RFID card not found"
            });
        }

        // Find the user associated with this phone number
        const user = await User.findOne({ 
            userPhone: rfidDocument.phoneNumber 
        });

        // Check if user exists
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found for this RFID card"
            });
        }

        // Check if user has a cycleId
        if (!user.cycleId) {
            return res.status(400).json({
                success: false,
                message: "User doesn't have an associated cycle"
            });
        }

        // Attach the required information to the request object
        req.user = { userPhone: user.userPhone };
        req.body.cycleId = user.cycleId;

        // Proceed to the next middleware
        next();
    } catch (error) {
        console.error("Error in card_id_to_phoneNumber_and_cycleId middleware:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};