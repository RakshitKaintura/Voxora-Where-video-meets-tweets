import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channelId = req.user?._id;

    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel id")
    }

    const totalVideos = await Video.countDocuments({owner: channelId})
    const totalSubscribers = await Subscription.countDocuments({channel: channelId})

    const totalViews = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group: {
                _id: null, // Group by null to sum all views into a single total
                totalViews: {
                    $sum: "$views"
                }
            }
        }
    ]);

    const totalLikes = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "allVideos",
            }
        },
        {
            $unwind: "$allVideos" 
        },
        {
            $match: {
                "allVideos.owner": new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group: {
                _id: null,  
                totalVideosLikes: {
                    $sum: 1 
                }
            }
        }
    ]);

    const channelStats = {
        totalSubscribers,
        totalVideos,
        totalViews: totalViews[0]?.totalViews || 0,
        totalLikes: totalLikes[0]?.totalVideosLikes || 0
    };

    res
    .status(200)
    .json(new ApiResponse(200, {channelStats}, "Channel stats fetched successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user?._id;
    const { page = 1, limit = 10 } = req.query;

    if(!mongoose.isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id");
    }

    const videoAggregate = Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        }
    ]);

    const videos = await Video.aggregatePaginate(
        videoAggregate,
        {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
            customLabels: {
                docs: "videos"
            }
        }
    );

    res
    .status(200)
    .json(new ApiResponse(200, {videos}, "Videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
    }
