/**
 * Create a connection function to mongodb
 * start a local mongodb server connection
 */
 const mongoose = require('mongoose');
 require ('dotenv').config();
 const { MONGO_URI } = process.env;
 
 
 
 // Async mongoose connection
 const connectDB = async () => {
     try {
         mongoose.connect(MONGO_URI, {
             useNewUrlParser: true,
             useUnifiedTopology: true
         })
         
         console.log('MonoDB connected....');
 
         // Seed data
     } catch (err) {
         console.error(err.message);
 
         // Exit with failure
         process.exit(1);
     }
 }
 
 module.exports = connectDB;