import Zone from "../models/zone.model.js";
import Cycle from "../models/cycle.model.js";

export const createZone = async (req, res) => {
    const zone = req.body;

    // Validate input
    if (!zone.zoneId || !zone.zoneLimit) {
        return res.status(400).json({ success: false, message: "Please provide all the fields" });
    }

    try {
        // Check if a zone with the same zoneId already exists
        const existingZone = await Zone.findOne({ zoneId: zone.zoneId });
        if (existingZone) {
            return res.status(409).json({ success: false, message: "Zone with the same zoneId already exists" });
        }

        // Create a new zone
        const newZone = new Zone(zone);
        await newZone.save();

        // Return success response
        return res.status(201).json({ success: true, data: newZone });
    } catch (err) {
        console.error("Error creating zone:", err.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const findZone = async (req, res) => {
    const { identifier } = req.body;

    // Validate input
    if (!identifier) {
        return res.status(400).json({ success: false, message: "Please provide a zone identifier" });
    }

    try {
        // Find the zone by zoneId
        const zone = await Zone.findOne({ zoneId: identifier });

        // If the zone is found, return its details
        if (zone) {
            return res.status(200).json({ success: true, data: zone });
        } else {
            // If the zone is not found, return a 404 response
            return res.status(404).json({ success: false, message: "No such zone found" });
        }
    } catch (err) {
        console.error("Error finding zone:", err.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const updateZone = async (req, res) => {
    const { id, increment, cycleId, newZoneCurrentValue } = req.query;

    try {
        if (increment === "false") {
            const updatedZone = await Zone.findByIdAndUpdate(
                id,
                {
                    zoneCurrentValue: newZoneCurrentValue,
                    $pull: { zoneCycles: { cycleId: cycleId } } // Only remove the cycleId provided
                },
                { new: true } // Return the updated document
            );
            return res.status(200).json({ 'success': true, 'data': updatedZone });

        } else if (increment === "true") {

            const zone = await Zone.findById(id);
            const cycleExists = zone.zoneCycles.some(cycle => cycle.cycleId === cycleId);
            if (cycleExists) {
                return res.status(200).json({ 'success': false, message: 'cycle already added' });
            }

            const updatedZone = await Zone.findByIdAndUpdate(
                id,
                {
                    zoneCurrentValue: newZoneCurrentValue,
                    $push: { zoneCycles: { cycleId: cycleId } } // adds the cycleId provided
                },
                { new: true } // Return the updated document
            );
            return res.status(200).json({ 'success': true, 'data': updatedZone });
        }
    } catch (err) {
        console.log("error in finding a new user", err.message);
        return res.status(500).json({ 'success': false, 'message': 'internal server error' });
    }
}

export const getallzone = async (req, res) => {
    try {
        const zones = await Zone.aggregate([
            {
                $addFields: {
                    cycleCount: { $size: "$zoneCycles" }
                }
            },
            { $sort: { cycleCount: -1 } } // -1 for descending
        ]);

        if (!zones || zones.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: "No zones found" 
            });
        }

        return res.status(200).json({ 
            success: true, 
            data: zones 
        });
    } catch (error) {
        console.error("Error fetching zones:", error.message);
        return res.status(500).json({ 
            success: false,
            message: "Internal server error",
            error: error.message 
        });
    }
};

export const deletezone = async (req, res) => {
    const { id } = req.params;

    // Validate input
    if (!id) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide a zone ID" 
        });
    }

    try {
        // First check if any cycles are associated with this zone
        const cyclesInZone = await Cycle.find({ zoneId: id });
        
        if (cyclesInZone.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot delete zone ${id} - it contains ${cyclesInZone.length} cycle(s)`,
                data: {
                    zoneId: id,
                    cycleCount: cyclesInZone.length
                }
            });
        }

        // If zone is empty, proceed with deletion using zoneId
        const deletedZone = await Zone.findOneAndDelete({ zoneId: id });

        if (deletedZone) {
            return res.status(200).json({ 
                success: true, 
                message: `Zone ${id} deleted successfully`,
                data: deletedZone
            });
        } else {
            return res.status(404).json({ 
                success: false, 
                message: `Zone ${id} not found` 
            });
        }

    } catch (err) {
        console.error("Error deleting zone:", err.message);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error",
            error: err.message
        });
    }
};