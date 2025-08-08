import express from "express";
import {
    getProfile,
    updateProfile,
    updateToken,
    allUsers,
    getUserById,
    deleteUser,
    allLogs,
    register,
    login,
    logout
} from "./authcontroller.js";

import authMiddleware from '../../middleware/authMiddleware.js';

const authRouter = express.Router();

// Public Auth Routes
authRouter.post("/registerUser", register);
authRouter.post("/loginUser", login);
authRouter.post("/logoutUser", logout); 

// Protected Profile Routes
authRouter.get("/getProfile", authMiddleware, getProfile);
authRouter.put("/updateProfile", authMiddleware, updateProfile);

// Firebase Token Route (Protected)
authRouter.put("/updateToken", authMiddleware, updateToken);

// Admin Routes (Protected)
authRouter.get("/allUsers", authMiddleware, allUsers);
authRouter.get("/user/:id", authMiddleware, getUserById);
authRouter.delete("/deleteUser/:id", authMiddleware, deleteUser);

// Logs (Protected)
authRouter.get("/allLogs", authMiddleware, allLogs);

export default authRouter;
