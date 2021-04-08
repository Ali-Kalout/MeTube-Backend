import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";

import authRouter from "./routes/auth.js";
import videoRouter from "./routes/video.js";
import searchRouter from "./routes/search.js";

const app = express();

app.use(bodyParser.json({ limit: "500mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));
app.use(cors());

app.use("/signin", authRouter);
app.use("/video", videoRouter);
app.use("/search", searchRouter);

const port = process.env.PORT || 5000;
mongoose.connect("mongodb://localhost:27017/MeTube", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
    .then(() => app.listen(port, () => console.log("Server running on port : " + port)))
    .catch(error => console.log(error));