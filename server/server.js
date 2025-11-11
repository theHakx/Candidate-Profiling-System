const dotenv = require('dotenv')
const express = require('express');
const path = require('path');
const mongoose = require('mongoose')
const cors = require('cors')

const userRoutes = require('./routes/userRoutes')
const profileRoutes = require('./routes/profileRoutes')
const passwordRoutes = require('./routes/passwordRoutes')
const adminRoutes = require('./routes/adminRoutes')
const publicRoutes = require('./routes/publicRoutes')
const bucketRoutes = require('./routes/bucketRoutes')

const connectDB = require('./db');

dotenv.config()

const app = express()

//middleware
app.use(cors())
app.use(express.json())

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB()

app.use('/api/users',userRoutes)
app.use('/api/profile',profileRoutes)
app.use('/api/password',passwordRoutes)
app.use('/api/admin',adminRoutes)
app.use('/api/public',publicRoutes)
app.use('/api/buckets', bucketRoutes)


const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`server runnin' on port ${PORT}`))
