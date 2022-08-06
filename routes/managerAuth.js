const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { SECRET } = process.env;
const auth = require('../middleware/managerAuth');
const { check, validationResult } = require('express-validator');

// Include User Model
const managerUser = require('../models/managerUser');


// @route       GET /api/managerAuth
// @desc        Get logged in manager user
// @access      Private
router.get('/', auth, async (req, res) => {
    // res.send('Get logged in staff');

    try {
        // Get manager user from db
        const managerUser = await managerUser.findById(req.managerUser.id).select('-password');
        res.json(managerUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route       POST /api/managerAuth
// @desc        Auth user manager & get token (manager logs in)
// @access      Public
router.post(
    '/',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ], 
    async (req, res) => {
        // res.send('Logged in as a manager');
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            let managerUser = await managerUser.findOne({ email });

            // console.log(managerUser);

            if (!managerUser) {
                return res.status(400).json({ msg: 'Invalid Credentials' });
            }

            // if manager, check the password
            const isMatch = await bcrypt.compare(password, managerUser.password);

            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid Credentials' });
            }

            // If Account is set to deactivated
            if (managerUser.isActive == false) {
                return res.status(403).json({ msg: 'Account Deactivated!' });
            }


            // If match, send token
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