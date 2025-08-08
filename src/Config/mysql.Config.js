import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.MYSQL_DB,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASS,
  {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    logging: false
  }
);

sequelize.sync({ alter: true })
  .then(() => {
    console.log("MySQL tables synced");
  })
  .catch((err) => {
    console.error("Table sync error:", err.message);
  });

export default sequelize;
