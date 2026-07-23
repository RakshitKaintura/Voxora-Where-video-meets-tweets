import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, type } = req.body
    if (!name || !description) {
        throw new ApiError(400, "Name and description is required");
    }
    //TODO: create playlist
    const playlist = await Playlist.create({
        name,
        description,
        type: type || "personal",
        owner: req.user._id
    });
    if (!playlist) {
        throw new ApiError(500, "Playlist did not get created");
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist got created sucessfully")
    );

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }
    const isOwner = req.user?._id?.toString() === userId.toString();
    const matchConditions = { owner: new mongoose.Types.ObjectId(userId) };
    
    if (!isOwner) {
        matchConditions.type = "creator"; // Hide personal playlists from other users
    }

    const playlists = await Playlist.aggregate([
        {
            $match: matchConditions
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "thumbnailVideo",
                pipeline: [
                    { $limit: 1 },
                    { $project: { thumbnail: 1 } }
                ]
            }
        },
        {
            $addFields: {
                totalVideos: { $size: "$videos" },
                coverImage: { $first: "$thumbnailVideo.thumbnail" }
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                totalVideos: 1,
                coverImage: 1,
                updatedAt: 1,
                videos: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, playlists, "Successfully got user playlists")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }
    
    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
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
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
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
                        $addFields: {
                            owner: { $first: "$owner" }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
                totalVideos: { $size: "$videos" }
            }
        }
    ]);

    if (!playlist?.length) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist[0].type === "personal" && playlist[0].owner._id.toString() !== req.user?._id?.toString()) {
        throw new ApiError(403, "You do not have permission to view this personal playlist");
    }

    return res.status(200).json(
        new ApiResponse(200, playlist[0], "Successfully fetched playlist by id")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "playlist id not valid")
    }
    if ( !isValidObjectId(videoId)) {
        throw new ApiError(400, "video id not valid")
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.type === "creator") {
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "Video not found");
        }
        if (video.owner.toString() !== playlist.owner.toString()) {
            throw new ApiError(403, "Creator playlists can only contain videos uploaded by the playlist owner.");
        }
    }

    const playlistVideos = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {
                videos: videoId
            }
        },
        {
            returnDocument: "after"
        }
    )
    res.status(200).json(
        new ApiResponse(200, { playlistVideos }, "Video is added to playlist sucessfully")
    );
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "playlist id not valid")
    }
    if ( !isValidObjectId(videoId)) {
        throw new ApiError(400, "video id not valid")
    }
    const playlistVideos = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId
            }
        },
        {
            returnDocument: "after"
        }
    )

    res.status(200).json(
        new ApiResponse(200, { playlistVideos }, "Video remove from playlist sucessfully")
    );

    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Playlist id not valid")
    }

    await Playlist.findByIdAndDelete(
        playlistId
    );
    res
    .status(200)
    .json(new ApiResponse(200,{},"Playlist is deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Playlist id not valid")
    }

    if(!name || !description || [name,description].some((field)=>field.trim()==="")){
        throw new ApiError(400,"All fields are required i.e name and description")
    }
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name:name,
                description:description
            }
        },
        {
            returnDocument: "after"
        }
    )

    res.status(200).json(
        new ApiResponse(200,{playlist},"Name and description is updated successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
