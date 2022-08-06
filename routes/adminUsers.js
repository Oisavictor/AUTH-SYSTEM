const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/adminAuth');
require('dotenv').config();
const { SECRET } = process.env;
const { check, validationResult } = require('express-validator');


// Admin user model
const AdminUser = require('../models/AdminUser');
const managerUser = require('../models/managerUser');


// @route       POST api/users/admin
// @desc        Register an admin based on if manager has managerId
// @accees      Public
router.post(
    '/', 
    [
        check('adminId', 'Admin ID is required to register as admin')
            .not()
            .isEmpty(),
        check('email', 'Please add a valid email').isEmail(),
        check('password', 'Please enter a valid password with 6 or more characters')
            .isLength({ min: 6 }),
    ], 
    async (req, res) => {
        // res.send('Admin registered!');
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { adminId, email, password } = req.body;

        try {
            // Check to see if there's a user with particular email
            let adminUser = await AdminUser.findOne({ email });

            if (adminUser) {
                return res.status(400).json({ msg: 'This admin exists already!'});
            }

            adminUser = new AdminUser({
                adminId,
                email,
                password
            });

            // Encrypt password with bcrypt
            const salt = await bcrypt.genSalt(10);

            adminUser.password = await bcrypt.hash(password, salt);

            await adminUser.save();

            // Send response
            const payload = {
                adminUser: {
                    id: adminUser.id
                }
            }

            jwt.sign(
                payload,
                SECRET,
                {
                    expiresIn: 360000
                },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);


// @route       GET api/users/admin/managers
// @desc        Super admin gets all managers
// @accees      Private
router.get('/managers', auth, async (req, res) => {
    try {
        // Pull from database 
        // const adminUser = await AdminUser.findById(req.adminUser.id).select('-password');
        const adminUser = await AdminUser.findById(req.adminUser.id).select('-password');

        if (adminUser) {
            // Find managers admin
            const managerUsers = await managerUser.find({ managerUser: req.managerUser });
        
            res.json(managerUsers);
        } else {
            // Unauthorised
            return res.status(401).json({ msg: 'Not authorized' });
        }


        // Find managers admin
        // const managerUsers = await managerUser.find({ managerUser: req.managerUser });

        // res.json(managerUsers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route       GET api/users/admin/managers
// @desc        Super admin gets managers by id
// @accees      Private
router.get('/managers/:id', auth, async (req, res) => {
    try {
        // Pull from database 

        const adminUser = await AdminUser.findById(req.adminUser.id).select('-password');

        if (adminUser) {
            // Find managers admin
            const managerUsers = await managerUser.findById(req.params.id);

            res.json(managerUsers);
        } else {
            // Unauthorised
            return res.status(401).json({ msg: 'Not authorized' });
        }
        
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route       PUT api/users/admin/managers
// @desc        Super admin deactivates manager
// @accees      Private
router.put('/managers/:id', auth, async (req, res) => {
    try {

        const adminUser = await AdminUser.findById(req.adminUser.id).select('-password');
        console.log(adminUser);
        console.log(auth)
        
        if (adminUser) {
            // Find managers admin
            let managerUser = await managerUser.findById(req.params.id);

            if (!managerUser) return res.status(404).json({ msg: 'manager not found' });

            let { isAdmin, isActive } = req.body;

            let managerFields = {};
        
            // Activate or Deactivate manager
            if (isActive) {
                managerFields.isActive = isActive;
            }

            // Set Admin status
            if (isAdmin) {
                managerFields.isAdmin = isAdmin;
            }
        
            // Update manager status
            managerUser = await managerUser.findByIdAndUpdate(req.params.id,
                { $set: managerFields },
                { new: true }  
            );

            
            res.json(managerUser);
        }
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Export
module.exports = router;