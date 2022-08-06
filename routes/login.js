const express = require('express');
const router = express.Router();
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// require('dotenv').config();
// const { SECRET } = process.env;
// const auth = require('../middleware/staffAuth');
// const { check, validationResult } = require('express-validator');


router.get('/', (req, res) => {
    res.status(200).json({
        "status": 'success_msg',
        "message": 'You are logged out'
    });

});

// Export 
module.exports = router;