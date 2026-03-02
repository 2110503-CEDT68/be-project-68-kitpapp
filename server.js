const express = require('express');
const dotenv = require('dotenv');
const cookieParser=require('cookie-parser');
const connectDB = require('./config/db');
// โหลด env ก่อน
dotenv.config({ path: './config/config.env' });

const restaurants = require('./routes/restaurant');
const auth = require('./routes/auth');
const appointments = require('./routes/appointments');

const { setServers } = require("node:dns/promises");

setServers(["1.1.1.1", "8.8.8.8"]);

// ค่อย connect DB
connectDB();

const app = express();
app.use(express.json());
//Cookie parser
app.use (cookieParser());
app.use('/api/v1/restaurants', restaurants);
app.use('/api/v1/auth', auth);
app.use('/api/v1/appointments', appointments);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err, promise)=> {
    console.log(`Error: ${err.message}`);
    server.close(()=>process.exit(1));
});