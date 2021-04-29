import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true
    },
    googleId: {
        type: String,
        unique: true
    },
    imageUrl: String,
    subscriptions: [String], // I subscribe to channel
    subscribers: [String] // user subscribe to my channel
});

const User = mongoose.model("User", userSchema);

export default User;