import userMongoModel from "./usermongomodel.js";
import usersqlmodel from "./usersqlmodel.js";
import logsqlmodel from "./logSqlModel.js";
import logMongoModel from "./logMongoMode.js";
import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Initialize models
const User = usersqlmodel(DataTypes);
const UserMongo = userMongoModel();
const LogSQL = logsqlmodel;
const LogMongo = logMongoModel;

export const insertLog = async (logData) => {
    try {
        await LogMongo.create(logData);
        await LogSQL.create(logData);
    } catch (err) {
        console.error("Log Insert Error:", err.message);
    }
};

// REGISTER
export const register = async (req, res) => {
    try {
        const { firstName, lastName, username, email, mobile, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ status: "error", message: "Required fields missing" });
        }

        const existingMongoUser = await UserMongo.findOne({ email });
        if (existingMongoUser) {
            return res.status(409).json({ status: "error", message: "User already exists" });
        }

        const existingSqlUser = await User.findOne({ where: { email } });
        if (existingSqlUser) {
            return res.status(409).json({ status: "error", message: "User already exists in SQL" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const mongoUser = await UserMongo.create({
            firstName,
            lastName,
            username,
            email,
            mobile,
            password: hashedPassword,
            lastLogin: new Date()
        });

        const sqlUser = await User.create({
            name: `${firstName} ${lastName}`,
            email,
            password: hashedPassword,
            role: 'user'
        });

        await insertLog({
            log_type: 5,
            table: 1,
            login_id: sqlUser.id,
            datetime: new Date(),
            ip: req.ip,
            device_details: req.headers['user-agent'],
            data_before_update: null,
            data_after_update: JSON.stringify({ firstName, lastName, username, email, mobile })
        });

        return res.status(201).json({
            status: "success",
            message: "User registered successfully",
            user: {
                id: sqlUser.id,
                email: sqlUser.email
            }
        });

    } catch (err) {
        console.error("Register Error:", err.message);
        return res.status(500).json({ status: "error", message: "Something went wrong during registration" });
    }
};

// LOGIN
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Check in MongoDB
        const mongoUser = await UserMongo.findOne({ email });
        if (!mongoUser) {
            return res.status(404).json({ message: "User not found! Register Yourself" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, mongoUser.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Update last login
        mongoUser.lastLogin = new Date();
        await mongoUser.save();

        // Check in MySQL
        const sqlUser = await User.findOne({ where: { email } });
        if (!sqlUser) {
            return res.status(404).json({ message: "User not found in MySQL" });
        }

        // Generate JWT token using env secret
        const token = jwt.sign(
            { id: sqlUser.id },
            process.env.JWT_SECRET,   // ✅ from .env
            { expiresIn: "1d" }
        );

        // Insert log
        await insertLog({
            log_type: 1,
            table: 1,
            login_id: sqlUser.id,
            datetime: new Date(),
            ip: req.ip,
            device_details: req.headers['user-agent'],
            data_before_update: null,
            data_after_update: JSON.stringify({ login: true })
        });

        // Send response
        res.status(200).json({
            status: "success",
            message: "Login successful",
            token,
            user: {
                id: sqlUser.id,
                email: sqlUser.email,
                name: sqlUser.name,
                username: sqlUser.username || null
            }
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = async (req, res) => {
    res.json({ message: "Logout logic to be implemented" });
};

export const getProfile = async (req, res) => {
    try {
        // Get SQL user
        const sqlUser = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        if (!sqlUser) return res.status(404).json({ message: "User not found" });

        // Get Mongo user for profile details
        const mongoUser = await UserMongo.findOne({ email: sqlUser.email });

        // Construct full name from MongoDB's firstName + lastName, fallback to sqlUser.name
        const fullName = mongoUser
            ? `${mongoUser.firstName || ''} ${mongoUser.lastName || ''}`.trim()
            : sqlUser.name;

        const userProfile = {
            id: sqlUser.id,
            name: fullName || sqlUser.name || 'No Name',
            email: sqlUser.email,
            username: mongoUser?.username || null,
            profilePic: mongoUser?.profilePic || null,
            mobile: mongoUser?.mobile || null,
            firstName: mongoUser?.firstName || null,
            lastName: mongoUser?.lastName || null,
        };

        res.json({ message: "User profile", user: userProfile });
    } catch (err) {
        console.error("GetProfile Error:", err);
        res.status(500).json({ message: err.message });
    }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, mobile } = req.body;

    // 1. SQL user update
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (firstName && lastName) user.name = `${firstName} ${lastName}`;
    if (email !== undefined) user.email = email;
    // Agar SQL user model me mobile hai to update karo
    if (mobile !== undefined && user.mobile !== undefined) user.mobile = mobile;

    await user.save();

    // 2. MongoDB user update
    const mongoUser = await UserMongo.findOne({ email: user.email }); 

    if (mongoUser) {
      if (firstName !== undefined) mongoUser.firstName = firstName;
      if (lastName !== undefined) mongoUser.lastName = lastName;
      if (email !== undefined) mongoUser.email = email;
      if (mobile !== undefined) mongoUser.mobile = mobile;

      await mongoUser.save();
    } else {

    }
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("UpdateProfile error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateToken = async (req, res) => {
    try {
        const { firebaseToken } = req.body;

        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.firebase_token = firebaseToken;
        await user.save();

        res.json({ message: "Firebase token updated successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const allUsers = async (req, res) => {
    const users = await UserMongo.find();
    res.json(users);
};

export const getUserById = async (req, res) => {
    try {
        const sqlUser = await User.findByPk(req.params.id);
        if (!sqlUser) return res.status(404).json({ message: "SQL User not found" });

        const mongoUser = await UserMongo.findOne({ email: sqlUser.email });
        if (!mongoUser) return res.status(404).json({ message: "Mongo User not found" });

        res.json({
            id: sqlUser.id,
            email: sqlUser.email,
            mongoProfile: mongoUser
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const sqlUser = await User.findByPk(req.params.id);
        if (!sqlUser) return res.status(404).json({ message: "SQL User not found" });

        const mongoDelete = await UserMongo.findOneAndDelete({ email: sqlUser.email });

        await sqlUser.destroy();

        res.json({
            message: "User deleted successfully",
            mongoDeleted: !!mongoDelete,
            sqlDeletedId: sqlUser.id
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// FIXED: Log list API
export const allLogs = async (req, res) => {
    try {
        const mongoLogs = await LogMongo.find().sort({ datetime: -1 });
        const sqlLogs = await LogSQL.findAll({
            order: [['datetime', 'DESC']]
        });

        return res.status(200).json({
            message: "Logs fetched successfully",
            logs: {
                mongo: mongoLogs,
                sql: sqlLogs
            }
        });
    } catch (err) {
        console.error("Logs Fetch Error:", err.message);
        return res.status(500).json({ message: 'Server error while fetching logs' });
    }
};