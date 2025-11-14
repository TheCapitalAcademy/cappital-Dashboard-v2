const router = require('express').Router();
const Admin = require('../models/admin');
const wrapAsync = require('../utils/wrapAsync');
const { isSuperAdmin } = require('../utils/middleware');

// Super Admin login route (username + password)
router.post('/super-login', wrapAsync(async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    
    try {
        const admin = await Admin.findOne({ username });
        
        if (!admin) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        
        // Use passport-local-mongoose's authenticate method
        admin.authenticate(password, (err, authenticatedUser, passwordErr) => {
            if (err) {
                return res.status(500).json({ message: "Server error during authentication" });
            }
            
            if (passwordErr || !authenticatedUser) {
                return res.status(401).json({ message: "Invalid username or password" });
            }
            
            // Successfully authenticated
            res.json({ 
                message: "Login successful",
                admin: {
                    id: admin._id,
                    username: admin.username,
                    role: admin.role
                }
            });
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Server error" });
    }
}));

router.post('/',wrapAsync(async (req, res) => {
    const adminData = {
        password: req.body.password
    };
    try {
        const updatedAdmin = await Admin.findOneAndUpdate(
            {}, // Search criteria (empty object means it will look for any document)
            adminData, // The data to update
            { new: true, upsert: true } // Options: create a new doc if none is found, return the updated doc
        );
        res.json(updatedAdmin);
    } catch (err) {
        res.json({ message: err });
    }
}));

router.get('/',wrapAsync(async (req, res) => {
    try {
        const admin = await Admin.findOne();
        res.json(admin);
    } catch (err) {
        res.json({ message: err });
    }
}));

// ONE-TIME: Create a brand new super admin
// DELETE THIS AFTER RUNNING IT ONCE!
router.post('/create-new-super-admin', wrapAsync(async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    
    try {
        // Check if username already exists
        const existing = await Admin.findOne({ username });
        if (existing) {
            return res.status(400).json({ message: "Username already exists. Choose a different one." });
        }
        
        // Create new super admin
        const newSuperAdmin = new Admin({ 
            username,
            role: 'super-admin'
        });
        
        await Admin.register(newSuperAdmin, password);
        
        console.log(`[SETUP] New super admin created: ${username}`);
        
        res.status(201).json({ 
            message: `New super admin created successfully!`,
            admin: { 
                username: newSuperAdmin.username, 
                role: newSuperAdmin.role,
                id: newSuperAdmin._id
            }
        });
        
    } catch (error) {
        console.error('Error creating super admin:', error);
        res.status(500).json({ message: error.message || "Failed to create super admin" });
    }
}));

// Check current admin role
router.get('/check-role', wrapAsync(async (req, res) => {
    try {
        const admin = await Admin.findOne();
        res.json({ 
            username: admin.username,
            role: admin.role || 'admin' 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}));

// Create new admin account - only super admin can do this
router.post('/create-admin', isSuperAdmin, wrapAsync(async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    
    try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin with this username already exists" });
        }
        
        // Create new admin with 'admin' role (NOT super-admin)
        const newAdmin = new Admin({ 
            username,
            role: 'admin' // Regular admin, not super-admin
        });
        
        // Register with password using passport-local-mongoose
        await Admin.register(newAdmin, password);
        
        console.log(`[AUDIT] Super admin created new admin: ${username} at ${new Date().toISOString()}`);
        
        res.status(201).json({ 
            message: `Admin account created successfully for ${username}`,
            admin: { 
                username: newAdmin.username, 
                role: newAdmin.role 
            }
        });
        
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ 
            message: error.message || "Failed to create admin account" 
        });
    }
}));

// Change password - only super admin can do this (changes their own password)
router.put('/change-password', isSuperAdmin, wrapAsync(async (req, res) => {
    const { newPassword } = req.body;
    
    if (!newPassword) {
        return res.status(400).json({ 
            message: "New password is required" 
        });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({ 
            message: "New password must be at least 6 characters long" 
        });
    }
    
    try {
        // req.user is the authenticated super admin from middleware
        const superAdmin = req.user;
        
        // Change the super admin's own password
        superAdmin.setPassword(newPassword, async (err) => {
            if (err) {
                return res.status(500).json({ 
                    message: "Failed to change password" 
                });
            }
            
            await superAdmin.save();
            
            // Log the change for audit trail
            console.log(`[AUDIT] Super admin ${superAdmin.username} changed their own password at ${new Date().toISOString()}`);
            
            res.status(200).json({ 
                message: `Password changed successfully` 
            });
        });
        
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: "Server error" });
    }
}));

// Get all admins - only super admin can view this
router.get('/all-admins', isSuperAdmin, wrapAsync(async (req, res) => {
    try {
        const admins = await Admin.find({}, 'username role _id'); // Only return username, role, and id
        res.json({ admins });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch admins" });
    }
}));



module.exports = router;