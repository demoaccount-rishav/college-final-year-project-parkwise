import cookieParser from 'cookie-parser';
import User from '../models/user.model.js'

const USER_COOKIE_NAME = 'user_token';

// Initialize middleware
export const initializeUserAuth = (app) => {
    app.use(cookieParser());
};

// User authentication middleware -- to be constructed
export const requireUser = (options = {}) => {
    return async (req, res, next) => {
        const token = req.cookies[USER_COOKIE_NAME];

        if (!token) {
            return options.redirectTo
                ? res.redirect(options.redirectTo)
                : res.status(401).json({ success: false, message: 'User login required' });
        }

        try {

            const user = await User.findOne({ tokenSecret: token });
            if (!user) {
                clearUserCookie(res);
                return handleUnauthorizedUser(res, options);
            }

            req.user = user;
            next();
        } catch (err) {
            console.error('User auth error:', err);
            clearUserCookie(res);
            return handleUnauthorizedUser(res, options);
        }
    };
};

// Set user auth cookie
export const setUserCookie = (res, token) => {
    res.cookie(USER_COOKIE_NAME, token, {
        httpOnly: true,
        maxAge: 8 * 60 * 60 * 1000 // 8 hour session
    });
};

// Clear user cookie
export const clearUserCookie = (res) => {
    res.clearCookie(USER_COOKIE_NAME);
};

const handleUnauthorizedUser = (res, options) => {
    return options.redirectTo
        ? res.redirect(options.redirectTo)
        : res.status(401).json({ success: false, message: 'User unauthorized' });
};