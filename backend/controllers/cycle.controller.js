import User from "../models/user.model.js";
import Cycle from "../models/cycle.model.js";
import Zone from "../models/zone.model.js";
import Card from "../models/card.model.js";

export const createCycle = async (req, res) => {
    try {
        const { cycleId, zoneId } = req.body;

        // Validate input
        if (!cycleId || !zoneId) {
            return res.status(400).json({ success: false, message: "Invalid input data: cycleId and zoneId are required" });
        }

        // Check if the cycle already exists
        const existingCycle = await Cycle.findOne({ cycleId });
        if (existingCycle) {
            return res.status(409).json({ success: false, message: "Cycle with the same cycleId already exists" });
        }

        // Check if the cycleId is associated with a valid user
        const user = await User.findOne({ cycleId });
        if (!user) {
            return res.status(404).json({ success: false, message: "CycleId is not associated with any valid user" });
        }

        // Check if the zone exists
        const zone = await Zone.findOne({ zoneId });
        if (!zone) {
            return res.status(404).json({ success: false, message: "Zone not found" });
        }

        // Check if the zone has reached its limit
        if (zone.zoneCurrentValue >= zone.zoneLimit) {
            return res.status(400).json({ success: false, message: "Zone limit reached" });
        }

        // Get the current system time
        const currentTime = new Date();

        // Create the entryExitTimes array with the current time for both entry and exit
        const entryExitTimes = [{
            entry: currentTime,
            exit: currentTime,
        }];

        // Create the new cycle
        const newCycle = new Cycle({ cycleId, zoneId, entryExitTimes });
        await newCycle.save();

        // Update the zone's zoneCycles and zoneCurrentValue
        zone.zoneCycles.push({ cycleId });
        zone.zoneCurrentValue += 1;
        await zone.save();

        // Return success response
        return res.status(201).json({ success: true, data: newCycle });
    } catch (error) {
        console.error("Error creating cycle:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const findAllCycle = async (req, res) => {

    try {
        const cycles = await Cycle.find()
            // .select('cycleId zoneId')
            .sort({ createdAt: -1 });
        // Do show last entry exit

        if (cycles) {
            return res.status(200).json({ 'success': true, 'data': cycles });
        } else {
            return res.status(404).json({ 'success': false, 'message': 'no cycle found' });
        }

    } catch (err) {
        console.log("error in finding cycles", err.message);
        return res.status(500).json({ 'success': false, 'message': 'internal server error' });
    }
}

export const deleteCycle = async (req, res) => {
    const { cycleId } = req.params;

    try {
        // Find the cycle by cycleId
        const cycle = await Cycle.findOne({ cycleId });
        if (!cycle) {
            return res.status(404).json({ success: false, message: "Cycle not found" });
        }

        // Check if the cycle's zoneId is "offline"
        if (cycle.zoneId !== "offline") {
            return res.status(400).json({ success: false, message: "Cycle cannot be deleted: zoneId is not offline" });
        }

        // Find the zone where the cycle is assigned (if any)
        const zone = await Zone.findOne({ zoneCycles: { $elemMatch: { cycleId: cycleId } } });

        // If the cycle is assigned to a zone, remove it from the zone
        if (zone) {
            // Remove the cycle from the zone's zoneCycles array
            zone.zoneCycles = zone.zoneCycles.filter(
                (cycleItem) => cycleItem.cycleId !== cycleId
            );
            // Decrement the zoneCurrentValue
            zone.zoneCurrentValue -= 1;
            await zone.save();
        }

        // Delete the cycle
        await Cycle.deleteOne({ cycleId });

        // Return success response
        return res.status(200).json({ success: true, message: "Cycle deleted successfully" });
    } catch (error) {
        console.error("Error deleting cycle:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const updateCycleExitTime = async (req, res) => {
    const { cycleId } = req.params;

    try {
        // Find the cycle by cycleId
        const cycle = await Cycle.findOne({ cycleId });

        // Check if the cycle exists
        if (!cycle) {
            return res.status(404).json({ success: false, message: "Cycle not found" });
        }

        // Get the current system time
        const currentTime = new Date();

        // Update the exit time of the last entryExit time
        const lastIndex = cycle.entryExitTimes.length - 1;
        cycle.entryExitTimes[lastIndex].exit = currentTime;

        // Find the zone where the cycle is assigned
        const zone = await Zone.findOne({ zoneCycles: { $elemMatch: { cycleId: cycleId } } });

        // If the cycle is assigned to a zone, remove it from the zone
        if (zone) {
            // Remove the cycle from the zone's zoneCycles array
            zone.zoneCycles = zone.zoneCycles.filter(
                (cycleItem) => cycleItem.cycleId !== cycleId
            );
            // Decrement the zoneCurrentValue
            zone.zoneCurrentValue -= 1;
            await zone.save();
        }

        // Set the zoneId of the cycle to "offline"
        cycle.zoneId = "offline";

        // Save the updated cycle
        await cycle.save();

        // Return success response
        res.status(200).json({ success: true, message: "Exit time updated and cycle removed from zone", cycle });
    } catch (error) {
        console.error("Error updating exit time:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const updateCycleZone = async (req, res) => {
    const { cycleid, zoneid } = req.params;

    try {
        // Find the cycle
        const cycle = await Cycle.findOne({ cycleId: cycleid });
        if (!cycle) {
            return res.status(404).json({ success: false, message: "Cycle not found" });
        }

        // Check if the previous zone is "offline"
        if (cycle.zoneId === "offline") {
            return res.status(400).json({ success: false, message: "Cannot update zone: currently cycle is offline" });
        }

        // Check if the new zone is the same as the previous zone
        if (cycle.zoneId === zoneid) {
            return res.status(400).json({ success: false, message: "Cannot update zone: new zone is the same as the previous zone" });
        }

        // Find the new zone
        const newZone = await Zone.findOne({ zoneId: zoneid });
        if (!newZone) {
            return res.status(404).json({ success: false, message: "New zone not found" });
        }

        // Check if the new zone has reached its limit
        if (newZone.zoneCurrentValue >= newZone.zoneLimit) {
            return res.status(400).json({ success: false, message: "Zone limit reached" });
        }

        // Find the current zone (if the cycle is already in a zone)
        const currentZone = await Zone.findOne({ zoneCycles: { $elemMatch: { cycleId: cycleid } } });

        // If the cycle is already in a zone, remove it from the current zone
        if (currentZone) {
            currentZone.zoneCycles = currentZone.zoneCycles.filter(
                (cycle) => cycle.cycleId !== cycleid
            );
            currentZone.zoneCurrentValue -= 1; // Decrement the current value
            await currentZone.save();
        }

        // Update the cycle's zoneId
        cycle.zoneId = zoneid;
        await cycle.save();

        // Add the cycle to the new zone
        newZone.zoneCycles.push({ cycleId: cycleid });
        newZone.zoneCurrentValue += 1; // Increment the current value
        await newZone.save();

        // Return success response
        res.status(200).json({ success: true, message: "Cycle zone updated successfully", cycle, newZone });
    } catch (error) {
        console.error("Error updating cycle zone:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const updateCycleEntryTime = async (req, res) => {
    const { cycleId, zoneId } = req.body;

    try {
        // Validate input
        if (!cycleId || !zoneId) {
            return res.status(400).json({ success: false, message: "cycleId and zoneId are required" });
        }

        // Find the cycle by cycleId
        const cycle = await Cycle.findOne({ cycleId });
        if (!cycle) {
            return res.status(404).json({ success: false, message: "Cycle not found" });
        }

        // Find the new zone by zoneId
        const newZone = await Zone.findOne({ zoneId });
        if (!newZone) {
            return res.status(404).json({ success: false, message: "New zone not found" });
        }

        // Check if the new zone has reached its limit
        if (newZone.zoneCurrentValue >= newZone.zoneLimit) {
            return res.status(400).json({ success: false, message: "Zone limit reached" });
        }

        // Get the current system time
        const currentTime = new Date();

        // Create a new entryExitTimes object with the current time for both entry and exit
        const newEntryExitTime = {
            entry: currentTime,
            exit: currentTime, // Exit time is initially set to the same as entry time
        };

        // Add the new entryExitTimes object to the cycle's entryExitTimes array
        cycle.entryExitTimes.push(newEntryExitTime);

        // Find the current zone (if the cycle is already in a zone)
        const currentZone = await Zone.findOne({ zoneCycles: { $elemMatch: { cycleId: cycleId } } });

        // If the cycle is already in a zone, remove it from the current zone
        if (currentZone) {
            currentZone.zoneCycles = currentZone.zoneCycles.filter(
                (cycleItem) => cycleItem.cycleId !== cycleId
            );
            currentZone.zoneCurrentValue -= 1; // Decrement the current value
            await currentZone.save();
        }

        // Update the cycle's zoneId to the new zoneId
        cycle.zoneId = zoneId;

        // Save the updated cycle
        await cycle.save();

        // Add the cycle to the new zone's zoneCycles array
        newZone.zoneCycles.push({ cycleId });
        newZone.zoneCurrentValue += 1; // Increment the current value
        await newZone.save();

        // Return success response
        res.status(200).json({ success: true, message: "Entry time updated and zone updated successfully", cycle });
    } catch (error) {
        console.error("Error updating entry time:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const cookie_based_view_user_cycle_details = async (req, res) => {
    try {
        const { userPhone } = req.user;

        // Find all users with this phone number to get their cycleIds
        const users = await User.find({ userPhone });
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No users found for the provided phone number"
            });
        }

        // Extract all cycleIds associated with this phone number
        const cycleIds = users.map(user => user.cycleId);

        // Find all cycles with these cycleIds
        const userCycles = await Cycle.find({
            cycleId: { $in: cycleIds }
        });

        // If no cycles found, inform the user
        if (userCycles.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No cycles found for the user"
            });
        }

        // Prepare the response data with all entry-exit times for each cycle
        const cyclesData = userCycles.map(cycle => ({
            cycleId: cycle.cycleId,
            zoneId: cycle.zoneId,
            entryExitTimes: cycle.entryExitTimes.map(time => ({
                entry: time.entry,
                exit: time.exit,
                duration: time.exit ? (time.exit - time.entry) / (1000 * 60) + " minutes" : "Not exited yet"
            }))
        }));

        return res.status(200).json({
            success: true,
            message: "Cycle entry-exit details retrieved successfully",
            data: cyclesData
        });

    } catch (error) {
        console.error("Error displaying cycle details of particular user:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export const cookie_based_pay_exit_single_user_cycle = async (req, res) => {
    try {
        const phoneNumber = req.user.userPhone;
        const { cycleId } = req.body;

        if (!cycleId) {
            return res.status(400).json({
                success: false,
                message: "Cycle ID is required"
            });
        }

        const debitAmountPerMinute = 10; // More descriptive variable name
        const minimumBalanceThreshold = 20; // Minimum required balance

        // Find the card and active cycle in parallel for better performance
        const [card, activeCycle] = await Promise.all([
            Card.findOne({ phoneNumber }),
            Cycle.findOne({
                cycleId,
                zoneId: { $ne: "offline" } // Only cycles that are not offline
            })
        ]);

        // Check if card exists
        if (!card) {
            return res.status(404).json({
                success: false,
                message: "Card not found for the provided phone number"
            });
        }

        // Check if cycle exists
        if (!activeCycle) {
            return res.status(404).json({
                success: false,
                message: "Can't pay. Cycle already offline"
            });
        }

        // Check if there are any entry/exit times
        if (activeCycle.entryExitTimes.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No entry records found for this cycle"
            });
        }

        // Calculate the total debit amount based on duration
        const lastEntry = activeCycle.entryExitTimes[activeCycle.entryExitTimes.length - 1];
        const currentTime = new Date();
        const entryTime = new Date(lastEntry.entry);
        const durationMinutes = (currentTime - entryTime) / (1000 * 60);
        // const totalDebitAmount = durationMinutes * debitAmountPerMinute;
        const totalDebitAmount = 10;

        // Check balance with the actual debit amount
        if (card.currentBalance < totalDebitAmount) {
            return res.status(400).json({
                success: false,
                message: `Insufficient balance. Required: ${totalDebitAmount.toFixed(2)}, Available: ${card.currentBalance.toFixed(2)}`
            });
        }

        // Check minimum balance threshold
        if ((card.currentBalance - totalDebitAmount) < minimumBalanceThreshold) {
            return res.status(400).json({
                success: false,
                message: `Transaction would leave balance below minimum threshold of ${minimumBalanceThreshold}`
            });
        }

        // Update the exit time of the last entryExit time
        lastEntry.exit = currentTime;
        lastEntry.duration = durationMinutes.toFixed(2) + " minutes";

        // Find and update the zone where the cycle is assigned
        const zone = await Zone.findOne({ zoneCycles: { $elemMatch: { cycleId: activeCycle.cycleId } } });
        const updatedZones = [];

        if (zone) {
            // Remove the cycle from the zone's zoneCycles array
            zone.zoneCycles = zone.zoneCycles.filter(
                (cycleItem) => cycleItem.cycleId !== activeCycle.cycleId
            );
            // Decrement the zoneCurrentValue (with floor at 0)
            zone.zoneCurrentValue = Math.max(0, zone.zoneCurrentValue - 1);
            await zone.save();
            updatedZones.push(zone.zoneId);
        }

        // Set the zoneId of the cycle to "offline"
        activeCycle.zoneId = "offline";
        await activeCycle.save();

        // Debit the amount and record transaction
        card.currentBalance -= totalDebitAmount;
        card.debit.push({
            amount: totalDebitAmount,
            timestamp: currentTime,
            cycleId: activeCycle.cycleId,
            duration: durationMinutes.toFixed(2) + " minutes"
        });

        await card.save();

        // Return success response
        return res.status(200).json({
            success: true,
            message: `Successfully debited ${totalDebitAmount.toFixed(2)} from card`,
            data: {
                phoneNumber: card.phoneNumber,
                currentBalance: card.currentBalance.toFixed(2),
                lastTransaction: {
                    type: "debit",
                    amount: totalDebitAmount.toFixed(2),
                    timestamp: currentTime,
                    duration: durationMinutes.toFixed(2) + " minutes",
                    cycleId: activeCycle.cycleId
                },
                updatedCycleId: activeCycle.cycleId,
                zonesUpdated: [...new Set(updatedZones)] // Remove duplicates
            }
        });

    } catch (error) {
        console.error("Error in cookie_based_pay_exit_single_user_cycle:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};