import Admin from '../models/admin.model.js';
import { setAdminCookie, clearAdminCookie } from '../middlewares/adminAuth.js';

// Create first admin (run once manually)
export const createFirstAdmin = async (req, res) => {
    const { adminName, adminPhone, adminPassword } = req.body;

    // Validate input
    if (!adminName || !adminPhone || !adminPassword) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required (adminName, adminPhone, adminPassword)'
        });
    }

    try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ adminPhone });
        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: 'Admin already exists',
                admin: {
                    name: existingAdmin.adminName,
                    phone: existingAdmin.adminPhone
                }
            });
        }

        // Create new admin
        const admin = new Admin({
            adminName,
            adminPhone,
            adminPassword, // Note: In production, hash this password
            tokenSecret: `${adminName}-${Date.now()}`
        });

        await admin.save();

        // Return success response
        return res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            admin: {
                name: admin.adminName,
                phone: admin.adminPhone,
                createdAt: admin.createdAt
            }
        });

    } catch (error) {
        console.error('Admin creation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create admin',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Admin login
export const adminLogin = async (req, res) => {
    const { adminPhone, adminPassword } = req.body;

    try {
        const admin = await Admin.findOne({ adminPhone });
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        // Simple password check (not secure for production)
        if (adminPassword !== admin.adminPassword) {
            return res.status(401).json({ success: false, message: 'Wrong password' });
        }

        // Generate token if none exists
        if (!admin.tokenSecret) {
            admin.tokenSecret = `admin-${Date.now()}-${Math.random().toString(36).substring(2)}`;
            await admin.save();
        }

        setAdminCookie(res, admin.tokenSecret);

        return res.status(200).json({
            success: true,
            message: 'Admin logged in',
            admin: {
                name: admin.adminName,
                phone: admin.adminPhone
            }
        });

    } catch (error) {
        console.error("Admin login error:", error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Admin logout
export const adminLogout = async (req, res) => {
    try {
        clearAdminCookie(res);
        return res.status(200).json({ success: true, message: 'Admin logged out' });
    } catch (error) {
        console.error("Admin logout error:", error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get current admin
export const getAdminProfile = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        return res.status(200).json({
            success: true,
            admin: {
                name: req.admin.adminName,
                phone: req.admin.adminPhone
            }
        });
    } catch (error) {
        console.error("Get admin error:", error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

