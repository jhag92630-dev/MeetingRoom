import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
    user_id: { type: String },
    meetingCode: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Meeting = mongoose.model("meeting", meetingSchema);
export { Meeting };