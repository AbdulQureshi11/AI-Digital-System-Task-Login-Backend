
import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
    log_type: Number,
    table: Number,
    login_id: Number,
    datetime: { type: Date, default: Date.now },
    ip: String,
    device_details: String,
    data_before_update: String,
    data_after_update: String,
});

const logMongoModel = mongoose.model('Log', logSchema);
export default logMongoModel;