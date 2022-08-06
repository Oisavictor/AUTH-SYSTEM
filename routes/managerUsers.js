const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {v4: uuid} = 'uuid';
require('dotenv').config();
const { SECRET } = process.env;
// const auth = require('../middleware/adminAuth');
const { check, validationResult } = require('express-validator');

// Include staff User model
const managerUser = require('../models/managerUser');
const AdminUser = require('../models/AdminUser');

// @route       POST /api/users/managers
// @desc        Register managers user
// @accees      Public
router.post(
    '/', 
    [
        check('name', 'Please add name')
            .not()
            .isEmpty(),
        check('email', 'Please add a valid email').isEmail(),
        check('password', 'Please enter a valid password with 6 or more characters')
            .isLength({ min: 6 }),
    ], 
    async (req, res) => {
        // res.send('staff registered!');
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, isAdmin, isActive } = req.body;

        try {
            // Check to see if there's a user with particular email
            let managerUser = await managerUser.findOne({ email });

            if (managerUser) {
                return res.status(400).json({ msg: 'This manager exists already!'});
            }

            managerUser = new managerUser({
                name,
                email,
                password,
                isAdmin,
                isActive
            });

            // Encrypt password with bcrypt
            const salt = await bcrypt.genSalt(10);

            managerUser.password = await bcrypt.hash(password, salt);

            await managerUser.save();

            // Send response
            const payload = {
                managerUser: {
                    id: managerUser.id
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




// Export
module.exports = router;
