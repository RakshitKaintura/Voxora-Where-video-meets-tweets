import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { Video } from "../models/video.model.js"
import { polishTweetContent, generateVideoAnnouncements } from "../utils/gemini.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const createTweet = asyncHandler(async (req, res) => {
    const {content, parentTweet}=req.body;
    const userId = req.user?._id; 
    if (!userId) {
      throw new ApiError(401, "Unauthorized: user not found");  
    }

    if(!content){
    throw new ApiError(400,"Content is required for the tweet");
    }

    let imageUrl = null;
    if (req.file?.path) {
        const imageFile = await uploadOnCloudinary(req.file.path);
        if (imageFile) {
            imageUrl = imageFile.url;
        }
    }

   const tweet=await Tweet.create({
        content,
        image: imageUrl,
        owner:userId,
        parentTweet: parentTweet || null
    });

    if(!tweet){
        throw new ApiError(500,"Tweet not created");
    }
    return res.status(200).json(
        new ApiResponse(200,tweet,"Tweet created sucessfully")
    )
})

const getTweetPipeline = (req, matchConditions) => [
    { $match: matchConditions },
    {
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
                { $project: { fullName: 1, username: 1, avatar: 1 } }
            ]
        }
    },
    {
        $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "tweet",
            as: "likes"
        }
    },
    {
        $lookup: {
            from: "tweets",
            localField: "_id",
            foreignField: "parentTweet",
            as: "replies"
        }
    },
    {
        $addFields: {
            owner: { $first: "$owner" },
            likesCount: { $size: "$likes" },
            repliesCount: { $size: "$replies" },
            isLiked: {
                $cond: {
                    if: { $in: [req.user?._id, "$likes.likedBy"] },
                    then: true,
                    else: false
                }
            }
        }
    },
    { $project: { likes: 0, replies: 0 } },
    { $sort: { createdAt: -1 } }
];

const getAllTweets = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const pipeline = getTweetPipeline(req, { parentTweet: null });
    const aggregate = Tweet.aggregate(pipeline);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: { docs: "tweets", totalDocs: "totalTweets" }
    };

    const tweets = await Tweet.aggregatePaginate(aggregate, options);

    res.status(200).json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const pipeline = getTweetPipeline(req, { 
        owner: new mongoose.Types.ObjectId(userId),
        parentTweet: null
    });
    const aggregate = Tweet.aggregate(pipeline);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: { docs: "tweets", totalDocs: "totalTweets" }
    };

    const tweets = await Tweet.aggregatePaginate(aggregate, options);

    res.status(200).json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId}= req.params;
    if(!tweetId){
        throw new ApiError(400,"Did not got tweet id ")
    }
    const cont = req.body.content;
    if(!cont){
        throw new ApiError(400,"Insert tweet content")
    }

    let imageUrl = undefined;
    if (req.file?.path) {
        const imageFile = await uploadOnCloudinary(req.file.path);
        if (imageFile) {
            imageUrl = imageFile.url;
        }
    }

    const updateData = { content: cont };
    if (imageUrl !== undefined) {
        updateData.image = imageUrl;
    } else if (req.body.image === "null") {
        updateData.image = null; // allow removing image
    }

    await Tweet.findByIdAndUpdate(tweetId,
        {
            $set: updateData
        },{
            returnDocument: "after"
        }
    )

    res.status(200).json(
        new ApiResponse(200,{},"tweet updated succesfully")
    )
})


const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}= req.params;

    if(!tweetId){
        return new ApiError(400,"did not got tweet id");
    }

    await Tweet.findByIdAndDelete(tweetId);

    res.status(200).json(new ApiResponse(200, {},"Tweet deleted sucessfuly")); 
})

const getTweetReplies = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    const pipeline = getTweetPipeline(req, { parentTweet: new mongoose.Types.ObjectId(tweetId) });
    // Override the sort order for replies (oldest first usually for threads)
    pipeline.pop(); 
    pipeline.push({ $sort: { createdAt: 1 } });
    
    const aggregate = Tweet.aggregate(pipeline);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: { docs: "tweets", totalDocs: "totalTweets" }
    };

    const replies = await Tweet.aggregatePaginate(aggregate, options);

    res.status(200).json(new ApiResponse(200, replies, "Tweet replies fetched successfully"));
});

const polishTweet = asyncHandler(async (req, res) => {
    const { content, tone } = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required to polish");
    }

    const polishedContent = await polishTweetContent(content, tone || 'grammar');

    if (!polishedContent) {
        throw new ApiError(500, "Failed to polish tweet");
    }

    return res.status(200).json(
        new ApiResponse(200, { content: polishedContent }, "Tweet polished successfully")
    );
});

const generateAnnouncements = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const announcements = await generateVideoAnnouncements(video.title, video.description);

    if (!announcements || announcements.length === 0) {
        throw new ApiError(500, "Failed to generate announcements");
    }

    return res.status(200).json(
        new ApiResponse(200, announcements, "Announcements generated successfully")
    );
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getAllTweets,
    polishTweet,
    getTweetReplies,
    generateAnnouncements
}
