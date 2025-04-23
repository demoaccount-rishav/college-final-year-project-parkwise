import Card from "../models/card.model.js";
import User from "../models/user.model.js";
import Cycle from "../models/cycle.model.js";
import Zone from "../models/zone.model.js";

export const createCard = async (req, res) => {
    try {
        const { phoneNumber, initialBalance } = req.body;

        // Validate input
        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Invalid input data: phoneNumber is required"
            });
        }

        // Check if the card already exists
        const existingCard = await Card.findOne({ phoneNumber });
        if (existingCard) {
            return res.status(409).json({
                success: false,
                message: "Card with the same phone number already exists"
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

        // Set initial balance (default to 0 if not provided)
        const currentBalance = initialBalance || 100;

        // Create credit entry if initial balance is provided and greater than 0
        let creditEntry = [];
        if (initialBalance && initialBalance > 0) {
            creditEntry = [{
                amount: initialBalance,
                timestamp: new Date()
            }];
        }

        // Create the new card
        const newCard = new Card({
            phoneNumber,
            currentBalance,
            credit: creditEntry,
            debit: []
        });

        await newCard.save();

        // Return success response
        return res.status(201).json({
            success: true,
            data: newCard
        });

    } catch (error) {
        console.error("Error creating card:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getAllCards = async (req, res) => {
    try {
        // Fetch all cards from the database with only selected fields
        const cards = await Card.find()
            .select('phoneNumber currentBalance')
            .sort({ createdAt: -1 });

        // Check if any cards exist
        if (cards.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No cards found",
                data: []
            });
        }

        // Return all cards with limited fields
        return res.status(200).json({
            success: true,
            count: cards.length,
            data: cards
        });

    } catch (error) {
        console.error("Error fetching cards:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getCardByPhoneNumber = async (req, res) => {
    try {
        const { phoneNumber } = req.params;

        // Validate input
        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
        }

        // Find card by phone number
        const card = await Card.findOne({ phoneNumber });

        // Check if card exists
        if (!card) {
            return res.status(404).json({
                success: false,
                message: "Card not found for the provided phone number"
            });
        }

        // Return card details
        return res.status(200).json({
            success: true,
            data: card
        });

    } catch (error) {
        console.error("Error fetching card by phone number:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const deleteCard = async (req, res) => {
    try {
        const { phoneNumber } = req.params;

        // Validate input
        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
        }

        // Find and delete the card
        const deletedCard = await Card.findOneAndDelete({ phoneNumber });

        // Check if card existed
        if (!deletedCard) {
            return res.status(404).json({
                success: false,
                message: "Card not found for the provided phone number"
            });
        }

        // Return success response
        return res.status(200).json({
            success: true,
            message: "Card deleted successfully",
            data: deletedCard
        });

    } catch (error) {
        console.error("Error deleting card:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const creditAmount = async (req, res) => {
    try {
        const { phoneNumber } = req.params;
        const { amount } = req.body;

        // Validate input
        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
        }

        if (!amount || isNaN(amount) || amount <= 0 || (amount % 50 !== 0 && amount % 100 !== 0)) {
            return res.status(400).json({
                success: false,
                message: "Valid credit amount greater than 0 and multiples of 50 or 100 is required"
            });
        }

        // Find the card
        const card = await Card.findOne({ phoneNumber });

        // Check if card exists
        if (!card) {
            return res.status(404).json({
                success: false,
                message: "Card not found for the provided phone number"
            });
        }

        // Add amount to current balance
        card.currentBalance += Number(amount);

        // Add credit transaction to history
        card.credit.push({
            amount: Number(amount),
            timestamp: new Date()
        });

        // Save the updated card
        await card.save();

        // Return success response
        return res.status(200).json({
            success: true,
            message: `Successfully credited ${amount} to card`,
            data: {
                phoneNumber: card.phoneNumber,
                currentBalance: card.currentBalance,
                lastTransaction: {
                    type: "credit",
                    amount: Number(amount),
                    timestamp: new Date()
                }
            }
        });

    } catch (error) {
        console.error("Error crediting amount:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const debitAmount = async (req, res) => {
    try {
        const { phoneNumber } = req.params;
        const debitAmount = 10; // Fixed debit amount of 10

        // Validate input
        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
        }

        // Find the card
        const card = await Card.findOne({ phoneNumber });

        // Check if card exists
        if (!card) {
            return res.status(404).json({
                success: false,
                message: "Card not found for the provided phone number"
            });
        }

        // Check if sufficient balance is available
        if (card.currentBalance < 20) {
            return res.status(400).json({
                success: false,
                message: "Insufficient balance to debit amount!! Current balance must be more than 20"
            });
        }

        // Find all users with this phone number to get their cycleIds
        const users = await User.find({ userPhone: phoneNumber });
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No users found for the provided phone number"
            });
        }

        // Extract all cycleIds associated with this phone number
        const cycleIds = users.map(user => user.cycleId);

        // Find all cycles with these cycleIds that are not offline
        const activeCycles = await Cycle.find({
            cycleId: { $in: cycleIds },
            zoneId: { $ne: "offline" } // Only cycles that are not offline
        });


        // If no active cycles, don't do anything and inform the user
        if (activeCycles.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No active cycles found. No changes made.",
                data: {
                    phoneNumber: card.phoneNumber,
                    currentBalance: card.currentBalance,
                    cyclesUpdated: 0
                }
            });
        }

        const currentTime = new Date();
        const updatedCycleIds = [];
        const updatedZones = [];

        // Process each cycle using the same logic as updateCycleExitTime
        for (const cycle of activeCycles) {
            try {
                // Update the exit time of the last entryExit time
                const lastIndex = cycle.entryExitTimes.length - 1;
                cycle.entryExitTimes[lastIndex].exit = currentTime;

                // Find the zone where the cycle is assigned
                const zone = await Zone.findOne({ zoneCycles: { $elemMatch: { cycleId: cycle.cycleId } } });

                // If the cycle is assigned to a zone, remove it from the zone
                if (zone) {
                    // Remove the cycle from the zone's zoneCycles array
                    zone.zoneCycles = zone.zoneCycles.filter(
                        (cycleItem) => cycleItem.cycleId !== cycle.cycleId
                    );
                    // Decrement the zoneCurrentValue
                    zone.zoneCurrentValue = Math.max(0, zone.zoneCurrentValue - 1);
                    await zone.save();
                    updatedZones.push(zone.zoneId);
                }

                // Set the zoneId of the cycle to "offline"
                cycle.zoneId = "offline";

                // Save the updated cycle
                await cycle.save();
                updatedCycleIds.push(cycle.cycleId);

            } catch (error) {
                console.error(`Error processing cycle ${cycle.cycleId}:`, error);
                // Continue with next cycle even if one fails
            }
        }

        // Debit the amount
        card.currentBalance -= activeCycles.length * debitAmount;

        // Add debit transaction to history
        card.debit.push({
            amount: debitAmount,
            timestamp: currentTime
        });

        // Save the updated card
        await card.save();

        // Return success response
        return res.status(200).json({
            success: true,
            message: `Successfully debited ${activeCycles.length * debitAmount} from card and updated cycles`,
            data: {
                phoneNumber: card.phoneNumber,
                currentBalance: card.currentBalance,
                lastTransaction: {
                    type: "debit",
                    amount: debitAmount,
                    timestamp: currentTime
                },
                cyclesUpdated: updatedCycleIds.length,
                updatedCycleIds: updatedCycleIds,
                zonesUpdated: [...new Set(updatedZones)] // Remove duplicates
            }
        });

    } catch (error) {
        console.error("Error debiting amount:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const cookie_based_view_card_details = async (req, res) => {
    try {
        const { userPhone } = req.user;

        // Validate input
        // if (!userPhone) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Phone number is required"
        //     });
        // }

        // Find card by phone number
        const card = await Card.findOne({ phoneNumber: userPhone });

        // Check if card exists
        if (!card) {
            return res.status(404).json({
                success: false,
                message: "Card not found for the provided phone number"
            });
        }

        // Return card details
        return res.status(200).json({
            success: true,
            data: card
        });

    } catch (error) {
        console.error("Error fetching card by phone number:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export const cookie_based_add_card_balance = async (req, res) => {
    try {
        const phoneNumber = req.user.userPhone;
        const { amount } = req.body;

        // Validate input
        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
        }

        if (!amount || isNaN(amount) || amount <= 0 || (amount % 50 !== 0 && amount % 100 !== 0)) {
            return res.status(400).json({
                success: false,
                message: "Valid credit amount greater than 0 and multiples of 50 or 100 is required"
            });
        }

        // Find the card
        const card = await Card.findOne({ phoneNumber });

        // Check if card exists
        if (!card) {
            return res.status(404).json({
                success: false,
                message: "Card not found for the provided phone number"
            });
        }

        // Add amount to current balance
        card.currentBalance += Number(amount);

        // Add credit transaction to history
        card.credit.push({
            amount: Number(amount),
            timestamp: new Date()
        });

        // Save the updated card
        await card.save();

        // Return success response
        return res.status(200).json({
            success: true,
            message: `Successfully credited ${amount} to card`,
            data: {
                phoneNumber: card.phoneNumber,
                currentBalance: card.currentBalance,
                lastTransaction: {
                    type: "credit",
                    amount: Number(amount),
                    timestamp: new Date()
                }
            }
        });

    } catch (error) {
        console.error("Error crediting amount:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};