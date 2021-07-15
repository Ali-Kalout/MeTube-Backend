import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";

import channelRouter from "./routes/channel.js";
import videoRouter from "./routes/video.js";
import searchRouter from "./routes/search.js";

const app = express();

app.use(bodyParser.json({ limit: "500mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));
app.use(cors());

app.get("/", (req, res) => res.send("Hello World"));

app.use("/channel", channelRouter);
app.use("/video", videoRouter);
app.use("/search", searchRouter);

mongoose.connect("mongodb+srv://admin-ali:test123@cluster0.8uyec.mongodb.net/MeTube", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
    .then(() => app.listen(process.env.PORT || 5000, () => console.log("Server running!")))
    .catch(error => console.log(error));