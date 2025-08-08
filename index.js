import cors from 'cors'
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import authRouter from './src/app/user/userrouter.js';
import connectMongo from './src/Config/mongodb.config.js';
import sequelize from './src/Config/mysql.Config.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 9000;

// Middleware
app.use(cors())
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.use('/api', authRouter);

// Connect to MongoDB
connectMongo();

// Connect to MySQL
sequelize.authenticate()
    .then(() => {
        console.log("MySQL connected");
    })
    .catch((err) => {
        console.error("MySQL connection error:", err.message);
    });

// Start server
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});
