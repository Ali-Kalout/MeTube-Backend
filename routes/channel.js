import express from "express";

import User from "./../models/user.js";
import auth from "./../middleware/auth.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { name, email, googleId, imageUrl } = req.body;
        const accExist = await User.findOne({ email: email });

        if (!accExist) {
            const user = new User({ name: name, email: email, googleId: googleId, imageUrl: imageUrl });
            await user.save();

            return res.status(200).json(user);
        } else {
            await User.findOneAndUpdate({ email: email }, { name, email, googleId, imageUrl }, { new: true });
        }

        return res.status(200).json(accExist);
    } catch (error) {
        console.log(error);
    }
});

router.post("/subscribe/:id", auth, async (req, res) => {
    if (!req.userId) return res.status(400).json({ message: "Unauthenticated ya 3rs !" });

    const myChannel = await User.findOne({ googleId: req.userId });
    const channel = await User.findById(req.params.id);

    if (!channel) return res.status(400).json({ message: "Channel not found !" });

    const index = myChannel.subscriptions.findIndex(id => id === String(channel._id));

    if (index === -1) {
        myChannel.subscriptions.push(channel._id);
        channel.subscribers.push(myChannel._id);
    } else {
        myChannel.subscriptions = myChannel.subscriptions.filter(id => id !== String(channel._id));
        channel.subscribers = channel.subscribers.filter(id => id !== String(myChannel._id));
    }

    await channel.save();
    await myChannel.save();

    return res.status(200).json(channel);
});

export default router;