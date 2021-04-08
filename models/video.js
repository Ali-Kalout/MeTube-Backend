import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title: String,
    thumbnail: String,
    selectedFile: String,
    creator: String,
    description: String,
    tags: [String],
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: [String],
        default: []
    },
    dislikes: {
        type: [String],
        default: []
    },
    createdAt: {
        type: String,
        default: new Date()
    }
});

const Video = mongoose.model("Video", videoSchema);

export default Video;