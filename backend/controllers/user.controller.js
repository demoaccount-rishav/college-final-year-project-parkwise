import User from "../models/user.model.js";
import Cycle from "../models/cycle.model.js";
import Zone from "../models/zone.model.js";

import { clearUserCookie, setUserCookie } from "../middlewares/userAuth.js";

export const createUser = async (req, res) => {
    const { userName, userPhone, userPassword } = req.body;

    try {
        // Basic validation
        if (!userName || !userPhone || !userPassword) {
            return res.status(400).json({ success: false, message: "All fields required" });
        }

        // Generate cycleId (your existing logic)
        const last5Digits = userPhone.slice(-5);
        const existingUsers = await User.find({ userPhone: { $regex: `^${userPhone}` } });
        const cycleId = `${last5Digits}@${(existingUsers.length + 1).toString().padStart(2, "0")}`;

        if (await Cycle.findOne({ cycleId })) {
            return res.status(400).json({ success: false, message: "CycleId exists" });
        }

        // Create user with plain password (not recommended for production)
        const tokenSecret = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
        const newUser = new User({
            userName,
            userPhone,
            cycleId,
            userPassword, // Storing plain password - only for simple/dev use
            tokenSecret
        });

        await newUser.save();

        return res.status(201).json({
            success: true,
            message: "User created",
            data: {
                userName: newUser.userName,
                userPhone: newUser.userPhone,
                cycleId: newUser.cycleId
            }
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// export const updateUser = async (req, res) => {
//     const { id } = req.params;
//     const user = req.body;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         return res.status(404).json({ 'success': false, message: 'invalid user id' });
//     }
//     try {
//         const updatedUser = await User.findByIdAndUpdate(id, user, { new: true });
//         res.status(200).json({ 'success': true, updatedData: updatedUser });
//     } catch (error) {
//         console.error('Error deleting user:', error.message);
//         res.status(500).json({ 'success': false, message: 'Internal server error' });
//     }
// }

export const deleteUser = async (req, res) => {
    const { userPhone } = req.params;

    try {
        // Find the user by phone number
        const user = await User.findOne({ userPhone });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Find the associated cycle
        const cycle = await Cycle.findOne({ cycleId: user.cycleId });
        if (!cycle) {
            await User.deleteOne({ userPhone });
            return res.status(200).json({ success: true, message: "User deleted with no associated cycle" });
        }

        // Check if the cycle's zoneId is "offline"
        if (cycle.zoneId !== "offline") {
            return res.status(400).json({ success: false, message: "User cannot be deleted: cycle is not offline" });
        }

        // Find the zone where the cycle is assigned (if any)
        const zone = await Zone.findOne({ zoneCycles: { $elemMatch: { cycleId: cycle.cycleId } } });

        // If the cycle is assigned to a zone, remove it from the zone
        if (zone) {
            // Remove the cycle from the zone's zoneCycles array
            zone.zoneCycles = zone.zoneCycles.filter(
                (cycleItem) => cycleItem.cycleId !== cycle.cycleId
            );
            // Decrement the zoneCurrentValue
            zone.zoneCurrentValue -= 1;
            await zone.save();
        }

        // Delete the cycle
        await Cycle.deleteOne({ cycleId: cycle.cycleId });

        // Delete the user
        await User.deleteOne({ userPhone });

        // Return success response
        res.status(200).json({ success: true, message: "User and associated cycle deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getalluser = async (req, res) => {

    try {
        const users = await User.find();
        if (users) {
            return res.status(200).json({ 'success': true, 'data': users, 'userCount': users.length });
        } else {
            return res.status(404).json({ 'success': false, 'message': 'no user found' });
        }

    } catch (err) {
        console.log("error in finding a new user", err.message);
        return res.status(500).json({ 'success': false, 'message': 'internal server error' });
    }
}


// cookie based user functions

export const cookie_based_create_user = async (req, res) => {
    const { userName, userPhone, userPassword } = req.body;

    // Validate input
    if (!userName || !userPhone || !userPassword) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required (userName, userPhone, userPassword)'
        });
    }

    try {
        // Check if user already exists
        const last5Digits = userPhone.slice(-5);
        const existingUsers = await User.find({ userPhone: { $regex: `^${userPhone}` } });
        const cycleId = `${last5Digits}@${(existingUsers.length + 1).toString().padStart(2, "0")}`;

        if (await Cycle.findOne({ cycleId })) {
            return res.status(400).json({ success: false, message: "CycleId exists" });
        }

        const tokenSecret = `${userName}-${Date.now()}`;
        const user = new User({
            userName,
            userPhone,
            cycleId,
            userPassword, // Storing plain password - only for simple/dev use
            tokenSecret
        });

        await user.save();

        // Return success response
        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            admin: {
                name: user.userName,
                phone: user.userPhone,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('User creation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const cookie_based_user_login = async (req, res) => {
    const { userPhone, userPassword } = req.body;

    try {
        const user = await User.findOne({ userPhone });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Simple password check (not secure for production)
        if (userPassword !== user.userPassword) {
            return res.status(401).json({ success: false, message: 'Wrong password' });
        }

        // Generate token if none exists
        if (!user.tokenSecret) {
            user.tokenSecret = `user-${Date.now()}-${Math.random().toString(36).substring(2)}`;
            await user.save();
        }

        setUserCookie(res, user.tokenSecret);

        return res.status(200).json({
            success: true,
            message: 'User logged in',
            user: {
                name: user.userName,
                phone: user.userPhone
            }
        });

    } catch (error) {
        console.error("User login error:", error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const cookie_based_user_details = async (req, res) => {
    const { userPhone } = req.user;

    try {
        // Find all users with the given userPhone
        const users = await User.find({ userPhone });

        // if (!users || users.length === 0) {
        //     return res.status(404).json({ success: false, message: "No users found with this phone number" });
        // }

        // Extract all cycleIds associated with these users
        const cycleIds = users.map(user => user.cycleId);

        // Find all cycles associated with these cycleIds
        const userCycles = await Cycle.find({ cycleId: { $in: cycleIds } }).select('cycleId zoneId');

        // Find all online cycles (where zoneId is not "offline")
        const onlineCycles = await Cycle.find({ zoneId: { $ne: "offline" }, cycleId: { $in: cycleIds } }).select('cycleId zoneId');

        // Return the users, their associated cycles, and all online cycles
        return res.status(200).json({
            success: true,
            message: `Registered cycles of ${userPhone} followed by cycles online`,
            data: {
                user: {
                    userName: users[0]["userName"],
                    userPassword: users[0]["userPassword"],
                    userPhone: userPhone
                },
                userCycles,
                onlineCycles
            }
        });
    } catch (err) {
        console.error("Error finding user:", err.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const cookie_based_user_logout = async (req, res) => {
    clearUserCookie(res);
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
};