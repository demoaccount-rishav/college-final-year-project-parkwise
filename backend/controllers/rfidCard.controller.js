import User from "../models/user.model.js";
import RFID from "../models/rfidCard.model.js";


export const create_RFID_card = async (req, res) => {
    try {
        const { rfidCard, phoneNumber } = req.body;

        // Validate input 
        if (!phoneNumber || !rfidCard) {
            return res.status(400).json({
                success: false,
                message: "Invalid input data: phoneNumber and rfidCard both are required"
            });
        }

        // Check if the card already exists
        const existingCard = await RFID.findOne({ rfidCard });
        if (existingCard) {
            return res.status(409).json({
                success: false,
                message: "Card with the same rfid already exists"
            });
        }

        // Check if the phone number is associated with a valid user
        const user = await User.findOne({ userPhone: phoneNumber });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Phone number is not associated with any valid user"
            });
        }

        // Check if phone number already has an RFID card
        const existingPhoneCard = await RFID.findOne({ phoneNumber });
        if (existingPhoneCard) {
            return res.status(409).json({
                success: false,
                message: "Phone number is already associated with another RFID card"
            });
        }

        // Create the new card
        const newCard = new RFID({
            rfidCard,
            phoneNumber
        });

        await newCard.save();

        // Return success response
        return res.status(201).json({
            success: true,
            message: "RFID card created successfully",
            data: newCard
        });

    } catch (error) {
        console.error("Error creating RFID card:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message // Include error message for debugging
        });
    }
};
