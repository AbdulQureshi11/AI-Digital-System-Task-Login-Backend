import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../../Config/mysql.Config.js";

const usersqlmodel = (DataType, Sequelize) => {
    return sequelize.define('users', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        firstName: {
            type: DataTypes.STRING,
        },
        lastName: {
            type: DataTypes.STRING,
        },
        username: {
            type: DataTypes.STRING,
        },
        email: {
            type: DataTypes.STRING,
        },
        mobile: {
            type: DataTypes.STRING,
        },
        password: {
            type: DataTypes.STRING,
        },
        firebaseToken: {
            type: DataTypes.STRING,
        },
        firebaseTokenRefreshTimestamp: {
            type: DataTypes.DATE,
        },
        lastLogin: {
            type: DataTypes.DATE,
        }
    });
};

export default usersqlmodel;
