// RequireAdmin.js
exports.requireAdmin = (req, res, next) => {

    if (!req.user) {
        return res.status(401).json({ 
            message: "Authentication required before checking admin status." 
        });
    }

    // 2. Check for the admin custom claim
    if (req.user.admin === true) {
        return next(); // They are an admin, proceed to the controller!
    }

    // 3. If they are logged in but NOT an admin, return a 403 Forbidden
    return res.status(403).json({ 
        message: "Access denied. Admin privileges required." 
    });
};