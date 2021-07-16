import User from "./../models/user.js";
import Video from "./../models/video.js";
import express from "express";
import getUser from "./../utils/getUser.js";

const router = express.Router();

router.get("/channel/:id", async (req, res) => {
    const channel = await User.findById(req.params.id);
    const videos = await Video.find({ creator: channel.googleId }).sort({ createdAt: -1 });

    for (let i = 0; i < videos.length; i++)
        videos[i].selectedFile = "";

    res.status(200).json({ channel: channel, videos: videos });
});

router.get("/watch/:id", async (req, res) => {
    const video = await Video.findById(req.params.id);
    const creator = await getUser(video.creator);

    res.status(200).json({ video: video, creator: creator });
});

export default router;