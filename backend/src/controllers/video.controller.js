import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query

    const pipeline = [];

    // 1. Match published videos
    const matchConditions = { isPublished: true };

    // 2. Search by query if provided
    if (query) {
        matchConditions.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    // 3. Filter by userId if provided
    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId");
        }
        matchConditions.owner = new mongoose.Types.ObjectId(userId);
    }

    pipeline.push({ $match: matchConditions });

    // 4. Join owner details
    pipeline.push({
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "ownerDetails",
            pipeline: [
                {
                    $project: {
                        fullName: 1,
                        username: 1,
                        avatar: 1
                    }
                }
            ]
        }
    });

    pipeline.push({
        $addFields: {
            owner: { $first: "$ownerDetails" }
        }
    });

    pipeline.push({
        $project: {
            ownerDetails: 0
        }
    });

    // 5. Sort
    const sortDirection = sortType === "asc" ? 1 : -1;
    pipeline.push({ $sort: { [sortBy]: sortDirection } });

    // 6. Paginate
    const aggregate = Video.aggregate(pipeline);
    
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: {
            totalDocs: "totalVideos",
            docs: "videos"
        }
    };

    const result = await Video.aggregatePaginate(aggregate, options);

    res.status(200).json(
        new ApiResponse(200, result, "Videos fetched successfully")
    );
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if([title,description].some((field)=>field.trim()==="")){
        throw new ApiError(400,"All fields are required")
    }

    const videoLocalPath= req.files?.videoFile[0].path;
    const thumbnailLocalPath=req.files?.thumbnail[0].path;
    if(!videoLocalPath && !thumbnailLocalPath){
        throw new ApiError(400,"All fields are required");
    }

    const video=await uploadOnCloudinary(videoLocalPath);

    if(!video){
        throw new ApiError(500,"There was an error uploading the video");
    }

    const thumbnail= await uploadOnCloudinary(thumbnailLocalPath);
    if(!thumbnail){
        throw new ApiError(500,"There was an error uploading the thumbnail");
    }

    const videoFile=await Video.create(
        {
            videoFile:video.url,
            thumbnail:thumbnail.url,
            title,
            description,
            duration:video.duration,
            owner:req.user._id
        }
    );

    res.status(200).json(
        new ApiResponse(200,{videoFile},"Published the video successfully")
    );
})


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Video id is not correct");
    }
    const video= await Video.findById(videoId);
    if(!video){
        throw new ApiError(400,"Video not fetched successfully");
    }
    return res.status(200).json(
        new ApiResponse(200,{video},"Video fetched successfully")
    );

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Video id is not correct");
    }

    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(400,"video not found");
    }

    let thumbnailLocalPath;
    if (req.files && req.files.thumbnail && req.files.thumbnail.length > 0) {
        thumbnailLocalPath = req.files.thumbnail[0].path;
    }
    
    if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbnail file not found");
    }
    
    const thumbnail=await uploadOnCloudinary(thumbnailLocalPath);
    if(!thumbnail) {
        throw new ApiError(500, "Error uploading thumbnail");
    }

    const {title,description}=req.body;
    if(!title || !description || [title,description].some((field)=>field.trim() ==="")){
        throw new ApiError(400,"All fields are required");
    }
    
    const updatedVideo=await Video.findByIdAndUpdate(
        videoId ,
        {
            $set:{
                title,
                description,
                thumbnail:thumbnail.url
            }
        },
        {
            returnDocument: "after"
        }
    );

    res.status(200).json(
        new ApiResponse(200,{updateVideo},"Successfully updated video ")
    )
    

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Video id is not correct");
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(400,"video not found");
    }
    await Video.findByIdAndDelete(videoId);

    res
    .status(200)
    .json(new ApiResponse(200,{},"Video is deleted successfully"))  
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Video id is not correct");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    video.isPublished = !video.isPublished;
    await video.save({ validateBeforeSave: false });

    res.status(200).json(
        new ApiResponse(200, { isPublished: video.isPublished }, "Video publish status is toggled successfully")
    );
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
