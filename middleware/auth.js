import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
    try {
        if (!req.headers.authorization)
            return false;
        const token = req.headers.authorization.split(" ")[1];
        const decodedData = jwt.decode(token);

        req.userId = decodedData.sub;

        next();
    } catch (error) {
        console.log(error);
    }
}

export default auth;