import cookieParser from 'cookie-parser';
import Admin from '../models/admin.model.js';

const ADMIN_COOKIE_NAME = 'admin_token';

// Initialize middleware
export const initializeAdminAuth = (app) => {
    app.use(cookieParser());
};

// Admin authentication middleware
export const requireAdmin = (options = {}) => {
    return async (req, res, next) => {
        const token = req.cookies[ADMIN_COOKIE_NAME];
        
        if (!token) {
            return options.redirectTo 
                ? res.redirect(options.redirectTo)
                : res.status(401).json({ success: false, message: 'Admin login required' });
        }

        try {
            const admin = await Admin.findOne({ tokenSecret: token });
            if (!admin) {
                clearAdminCookie(res);
                return handleUnauthorized(res, options);
            }

            req.admin = admin;
            next();
        } catch (err) {
            console.error('Admin auth error:', err);
            clearAdminCookie(res);
            return handleUnauthorized(res, options);
        }
    };
};

// Set admin auth cookie
export const setAdminCookie = (res, token) => {
    res.cookie(ADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        maxAge: 8 * 60 * 60 * 1000 // 8 hour session
    });
};

// Clear admin cookie
export const clearAdminCookie = (res) => {
    res.clearCookie(ADMIN_COOKIE_NAME);
};

const handleUnauthorized = (res, options) => {
    return options.redirectTo
        ? res.redirect(options.redirectTo)
        : res.status(401).json({ success: false, message: 'Admin unauthorized' });
};