const express = require('express');
const connectDB = require('./db/index');
require('dotenv').config(); // allows for environmental variables in .env



// Connect Database
connectDB();

// Initialise express
const app = express();


// Initialise Middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.json({ msg: 'Hello world!'}));


// Define Routes
app.use('/api/users/staffs', require('./routes/staffUsers'));
app.use('/api/users/managers', require('./routes/managerUsers'));
app.use('/api/users/admin', require('./routes/adminUsers'));
app.use('/api/staffAuth', require('./routes/staffAuth'));
app.use('/api/managerAuth', require('./routes/managerAuth'));
app.use('/api/adminAuth', require('./routes/adminAuth'));
app.use('/api/login', require('./routes/login'));
app.use('/api/logout', require('./routes/logout'));


const Port = process.env.PORT || 9005;

// Listen
app.listen(Port, () => console.log(`Server started on : http://localhost:${Port}`));