import mongoose from "mongoose";

const cycleSchema = new mongoose.Schema({
    cycleId: {
        type: String,
        required: true
    },
    zoneId: {
        type: String,
        required: true
    },
    entryExitTimes: [{
        entry: {
            type: Date,
            required: true
        },
        exit: {
            type: Date,
            required: true
        }
    }]
}, { timestamps: true });

const Cycle = mongoose.model("Cycle", cycleSchema);
export default Cycle;

