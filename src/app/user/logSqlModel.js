// models/logsqlmodel.js
import { DataTypes } from 'sequelize';
import sequelize from '../../Config/mysql.Config.js';

const LogSQL = sequelize.define('Log', {
    log_type: DataTypes.INTEGER,
    table: DataTypes.INTEGER,
    login_id: DataTypes.INTEGER,
    datetime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    ip: DataTypes.STRING,
    device_details: DataTypes.STRING,
    data_before_update: DataTypes.TEXT,
    data_after_update: DataTypes.TEXT,
});

export default LogSQL;
