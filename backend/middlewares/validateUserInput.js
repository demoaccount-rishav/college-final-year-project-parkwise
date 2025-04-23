export const validateUserInput = (req, res, next) => {
    const { userPhone, userPassword } = req.body;

    // Check if userPhone is empty
    if (!userPhone) {
        return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    // Check if userPhone is exactly 10 digits
    if (!/^\d{10}$/.test(userPhone)) {
        return res.status(400).json({ success: false, message: "Phone number must be 10 digits" });
    }

    // Check if userPassword is empty
    if (!userPassword) {
        return res.status(400).json({ success: false, message: "Password is required" });
    }

    // Check if userPassword is at least 5 characters
    if (userPassword.length < 5) {
        return res.status(400).json({ success: false, message: "Password must be at least 5 characters" });
    }

    // If all validations pass, proceed to the next middleware/function
    next();
};