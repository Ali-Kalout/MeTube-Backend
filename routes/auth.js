import express from "express";

import User from "./../models/user.js";

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

export default router;