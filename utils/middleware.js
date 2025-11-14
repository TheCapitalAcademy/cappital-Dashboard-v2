const userModel = require("../models/user");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login')
    }
    next();
}

module.exports.isSuperAdmin = async (req, res, next) => {
    try {
        // For now, verify super admin by checking password in request body
        // TODO: Implement proper admin session authentication later
        const { superAdminPassword, adminId } = req.body;
        
        if (!superAdminPassword) {
            return res.status(401).json({ 
                message: "Super admin password required" 
            });
        }
        
        const Admin = require('../models/admin');
        
        // If adminId is provided, verify that specific admin is a super admin
        // Otherwise, find any super admin (for other operations like creating admins)
        let superAdmin;
        if (adminId) {
            superAdmin = await Admin.findById(adminId);
            if (!superAdmin || superAdmin.role !== 'super-admin') {
                return res.status(403).json({ 
                    message: "Not a super admin account" 
                });
            }
        } else {
            superAdmin = await Admin.findOne({ role: 'super-admin' });
            if (!superAdmin) {
                return res.status(403).json({ 
                    message: "No super admin found" 
                });
            }
        }
        
        // Verify password
        superAdmin.authenticate(superAdminPassword, (err, user, passwordErr) => {
            if (err || passwordErr || !user) {
                return res.status(401).json({ 
                    message: "Invalid super admin password" 
                });
            }
            
            // Attach super admin to request for use in routes
            req.user = superAdmin;
            next();
        });
        
    } catch (error) {
        console.error('Super admin auth error:', error);
        res.status(500).json({ message: "Authentication error" });
    }
}


module.exports.isBuyCourse = async (req, res, next) => {
    if (req.isAuthenticated()) {
        const user = userModel.findById(req.user._id);
        const course = req.body.course?.trim();
        if (course === 'mdcat') {
            (!user.isMdcat) && res.status(401).json({});
        }
        if (course === 'nums') {
            (!user.isNums) && res.status(401).json({});
        }
    }
    next();
}



module.exports.checkTrialStatus = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const user = await userModel.findById(userId);

        if (user) {
            const currentDate = new Date();
            if (user?.isTrialActive && user?.trialExpires < currentDate) {
                await userModel.findByIdAndUpdate(userId, { isTrialActive: false });
                req.user.isTrialActive = false;
            }
        }
        next();
    } catch (error) {
        next();
    }
};