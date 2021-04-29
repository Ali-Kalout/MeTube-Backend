import express from "express";
import auth from "./../middleware/auth.js";
import Video from "./../models/video.js";
import getUser from "./../utils/getUser.js";

const router = express.Router();

router.get("/", async (req, res) => { // get videos
    const PAGE_SIZE = 24, result = [];
    const videos = await Video.find().sort({ createdAt: -1 })
        // .skip(parseInt(req.query.page) === 1 ? 0 : parseInt(req.query.page) * PAGE_SIZE)
        .limit(PAGE_SIZE * parseInt(req.query.page) + 1);

    for (let i = 0; i < videos.length; i++) {
        let vid = videos[i];
        let creator = await getUser(videos[i].creator);

        result.push({ video: vid, creator: creator });
    }

    return res.status(200).json(result);
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
    await Video.findById(req.params.id, (err, doc) => {
        if (!err) {
            doc.views += 1;
            doc.save();
        }
    });

    return res.status(200);
})

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