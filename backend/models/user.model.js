import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    userPhone: { type: String, required: true },
    cycleId: { type: String, required: true },
    userPassword: { type: String, required: true }, // Now stores hash
    tokenSecret: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;