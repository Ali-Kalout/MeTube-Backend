import express from "express";
import mongoose from "mongoose";
import auth from "./../middleware/auth.js";
import Video from "./../models/video.js";
import getUser from "./../utils/getUser.js";

const router = express.Router();

router.delete("/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;
        const videoToDelete = await Video.findById(id);
        if (videoToDelete.creator === req.userId) {
            await Video.findByIdAndDelete(id);
            return res.status(200);
        }
        return res.status(400);
    } catch (error) {
        res.status(400);
    }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    const creator = await getUser(video.creator);

    return res.status(200).json({ video: video, creator: creator });
});

router.get("/search/:searchQuery", async (req, res) => { // search videos
    try {
        const { searchQuery } = req.params;
        const title = new RegExp(searchQuery, 'i');

        const result = [];
        const videos = (await Video.find({ title }).sort({ _id: -1 })).
            concat(await Video.find({ description: title }).sort({ _id: -1 }));
        for (let i = 0; i < videos.length; i++) {
            videos[i].selectedFile = "";
            result.push({ video: videos[i], creator: await getUser(videos[i].creator) });
        }

        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
    }
});

router.get("/", async (req, res) => { // get videos
    const { page } = req.query;
    const LIMIT = 8, startIndex = (Number(page) - 1) * LIMIT; // get starting index of every page
    const total = await Video.countDocuments({});

    const videos = await Video.find().sort({ _id: -1 }).limit(LIMIT).skip(startIndex);

    const result = [];
    for (let i = 0; i < videos.length; i++) {
        let vid = videos[i];
        let creator = await getUser(videos[i].creator);
        vid.selectedFile = "";

        result.push({ video: vid, creator: creator });
    }

    return res.status(200).json({
        data: result,
        currentPage: page,
        numberOfPages: Math.ceil(total / LIMIT)
    });
});

router.post("/:id/:action", auth, async (req, res) => { // like / dislike video
    const likeAction = req.params.action === "like";
    try {
        if (!req.userId) return res.status(400).json({ message: "Unauthenticated ya 3rs !" });

        const video = await Video.findById(req.params.id);

        if (!video) return res.status(400);

        if (likeAction) {
            const index = video.likes.findIndex(id => id === String(req.userId));
            const secondIndex = video.dislikes.findIndex(id => id === String(req.userId));

            if (index === -1) video.likes.push(req.userId);
            else video.likes = video.likes.filter(id => id !== String(req.userId));

            if (secondIndex !== -1) video.dislikes = video.dislikes.filter(id => id !== String(req.userId));
        } else {
            const index = video.dislikes.findIndex(id => id === String(req.userId));
            const secondIndex = video.likes.findIndex(id => id === String(req.userId));

            if (index === -1) video.dislikes.push(req.userId);
            else video.dislikes = video.dislikes.filter(id => id !== String(req.userId));

            if (secondIndex !== -1) video.likes = video.likes.filter(id => id !== String(req.userId));
        }

        const updatedVideo = await Video.findByIdAndUpdate(req.params.id, video, { new: true });

        res.status(200).json({ video: updatedVideo, creator: await getUser(updatedVideo.creator) });
    } catch (error) {
        console.log(error);
    }
});

router.post("/:id", async (req, res) => { // add viewer
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id))
            return true;

        await Video.findById(id, (err, doc) => {
            if (!err) {
                doc.views += 1;
                doc.save();
            }
        });

        return res.status(200);
    } catch (error) {
        console.log(error);
    }
});

router.post("/", auth, async (req, res) => { // upload video
    try {
        const { title, thumbnail, selectedFile, description, tags } = req.body;

        const video = new Video({
            title: title, thumbnail: thumbnail, selectedFile: selectedFile,
            creator: req.userId, description: description, tags: tags, createdAt: new Date()
        });

        await video.save();

        return res.status(200).json(video);
    } catch (error) {
        return res.status(400).json({ message: error });
    }
});

export default router;