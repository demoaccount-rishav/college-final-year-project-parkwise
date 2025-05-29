import mongoose from "mongoose";

const rfidSchema = new mongoose.Schema({
    rfidCard: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true });

const RFID = mongoose.model("RFID", rfidSchema);
export default RFID;