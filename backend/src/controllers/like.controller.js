import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }
    const video=await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const existingLike= await Like.findOne(
        {
            video:videoId,
            likedBy:req.user._id

        }
);
if(existingLike){
    await Like.deleteOne(
        {
            video:videoId,
            likedBy:req.user._id
        }
    )
}

else{
    await Like.create(
        {
             video:videoId,
            likedBy:req.user._id
        }
    )
}

const hasUserLiked=existingLike ?false :true;
const totalLikes= await Like.countDocuments({video:videoId});

res.status(200).json(
    new ApiResponse(200,{hasUserLiked,totalLikes},"Video Liked is toggled successfully")
);
    
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "comment id not found")
    }
    const comment = await Comment.findById(
        commentId
    );
    if(!comment){
       throw new ApiError(400,"Comment not found");
    }

    const existingLike=await Like.findOne({
        comment:commentId,
        likedBy:req.user._id
    })

    if(existingLike){
        await Like.deleteOne({
            comment:commentId,
            likedBy:req.user._id
        })
    }
    else{
        await Like.create({
            comment:commentId,
            likedBy:req.user._id
        })
    }

    const hasUserLiked=existingLike?false:true;
    const totalLikes=await Like.countDocuments( {comment:commentId});

    res.status(200).json(
        new ApiResponse(200,{hasUserLiked,totalLikes},"like on comment is toggle successfully")
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "tweetId not found")
    }
    const tweet = await Tweet.findById(
        tweetId
    );
    if(!tweet){
       throw new ApiError(400,"Tweet not found");
    }

    const existingLike=await Like.findOne({
        tweet:tweetId,
        likedBy:req.user._id
    })

    if(existingLike){
        await Like.deleteOne({
            tweet:tweetId,
            likedBy:req.user._id
        })
    }
    else{
        await Like.create({
            tweet:tweetId,
            likedBy:req.user._id
        })
    }

    const hasUserLiked=existingLike?false:true;
    const totalLikes=await Like.countDocuments( {tweet:tweetId});

    res.status(200).json(
        new ApiResponse(200,{hasUserLiked,totalLikes},"like on tweet is toggle successfully")
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user?._id;
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: userId,
                video: { $exists: true }
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        { $unwind: "$video" },
        {
            $lookup: {
                from: "users",
                localField: "video.owner",
                foreignField: "_id",
                as: "video.ownerDetails"
            }
        },
        {
            $addFields: {
                "video.owner": { $first: "$video.ownerDetails" }
            }
        },
        { $project: { "video.ownerDetails": 0 } }
    ]);

    res.status(200).json(
        new ApiResponse(200,{likedVideos},"Liked videos are fetched succesfully")
    );
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
