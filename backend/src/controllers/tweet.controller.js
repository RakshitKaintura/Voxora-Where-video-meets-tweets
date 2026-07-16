import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content}=req.body;
    const userId = req.user?._id; 
    if (!userId) {
      throw new ApiError(401, "Unauthorized: user not found");  
    }

    if(!content){
    throw new ApiError(400,"Content is required for the tweet");
    }


   const tweet=await Tweet.create({
        content,
        owner:userId
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
        $addFields: {
            owner: { $first: "$owner" },
            likesCount: { $size: "$likes" },
            isLiked: {
                $cond: {
                    if: { $in: [req.user?._id, "$likes.likedBy"] },
                    then: true,
                    else: false
                }
            }
        }
    },
    { $project: { likes: 0 } },
    { $sort: { createdAt: -1 } }
];

const getAllTweets = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const pipeline = getTweetPipeline(req, {});
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

    const pipeline = getTweetPipeline(req, { owner: new mongoose.Types.ObjectId(userId) });
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
    //TODO: update tweet
    const {tweetId}= req.params;
    if(!tweetId){
        throw new ApiError(400,"Did not got tweet id ")
    }
    const cont=await req.body.content;
    if(!cont){
        throw new ApiError(400,"Insert tweet content")
    }
    await Tweet.findByIdAndUpdate(tweetId,

        {
            $set:{
                content:cont
            }
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

export {
    createTweet,
    getAllTweets,
    getUserTweets,
    updateTweet,
    deleteTweet
}
