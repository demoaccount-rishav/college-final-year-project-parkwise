import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema({
    zoneId: {
        type: String,
        required: true
    },
    zoneLimit: {
        type: Number,
        required: true
    },
    zoneCurrentValue: {
        type: Number,
        required: true,
    },
    zoneCycles: [{
        cycleId: {
            type: String,
        },
    }]
}, { timestamps: true })

const Zone = mongoose.model("Zone", zoneSchema);
export default Zone;