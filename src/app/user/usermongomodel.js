import mongoose from "mongoose";

const userMongoModel = () => {
    const schema = new mongoose.Schema({
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        username: {
            type: String,
        },
        email: {
            type: String,
        },
        mobile: {
            type: String,
        },
        password: {
            type: String,
        },
        firebaseToken: {
            type: String,
        },
        firebaseTokenRefreshTimestamp: {
            type: Date,
        },
        lastLogin: {
            type: Date,
        }
    }, {
        timestamps: true
    });

    return mongoose.model("UserMongo", schema);
};

export default userMongoModel;
