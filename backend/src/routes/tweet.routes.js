import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getAllTweets,
    getUserTweets,
    updateTweet,
    getTweetReplies,
    polishTweet,
    generateAnnouncements
} from "../controllers/tweet.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(upload.single("image"), createTweet).get(getAllTweets);
router.route("/user/:userId").get(getUserTweets);
router.route("/polish").post(polishTweet);
router.route("/generate-announcements/:videoId").get(generateAnnouncements);
router.route("/:tweetId/replies").get(getTweetReplies);
router.route("/:tweetId").patch(upload.single("image"), updateTweet).delete(deleteTweet);

export default router