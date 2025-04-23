import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    currentBalance: {
        type: Number,
        required: true,
        default: 0
    },
    credit: [{
        amount: {
            type: Number,
            required: true
        },
        timestamp: {
            type: Date,
            required: true,
            default: Date.now
        }
    }],
    debit: [{
        amount: {
            type: Number,
            required: true
        },
        timestamp: {
            type: Date,
            required: true,
            default: Date.now
        }
    }]
}, { timestamps: true });

const Card = mongoose.model("Card", cardSchema);
export default Card;