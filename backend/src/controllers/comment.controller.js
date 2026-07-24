import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {generateCommentSentiment} from "../utils/gemini.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id");
    }

    const aggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
                parentComment: null
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
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
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "parentComment",
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
        {
            $project: {
                likes: 0,
                replies: 0
            }
        }
    ]);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: "desc" },
        customLabels: {
            docs: "comments",
            totalDocs: "totalComments"
        }
    };

    const comments = await Comment.aggregatePaginate(aggregate, options);

    res.status(200).json(
        new ApiResponse(200, comments, "Comments fetched successfully")
    );
})

const addComment = asyncHandler(async (req, res) => {
    const {videoId}=req.params
    const user_id = req.user?._id;
    const {content, parentComment}=req.body
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id")
    }
    if(!content.trim()){
        throw new ApiError(400,"Comment text is required")
    }
    const comment=await Comment.create(
        {
            content:content,
            video:videoId,
            owner:user_id,
            parentComment: parentComment || null
        }
    )

    return res.status(200).json(
        new ApiResponse(200,comment,"Comment sucessfully added ")
    );
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {content}=req.body;
    const {comment_id}=req.params;
    if(!isValidObjectId(comment_id)){
        throw new ApiError(400,"Invalid comment id")
    }
    if(!content.trim()){
        throw new ApiError(400,"Comment Text is required");
    }
    const comment=await Comment.findByIdAndUpdate(
        comment_id,
        {
            $set:{
                content:content
            }
        },{
            returnDocument: "after"
        }
    );

    return res.status(200).json(
        new ApiResponse(
            200,{comment},"Updated comment successfully"
        )
    );

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const {comment_id}=req.params;
    if(!isValidObjectId(comment_id)){
        throw new ApiError(400,"Invalid comment id")
    }

    await Comment.findByIdAndDelete(
        comment_id
    )
    return res.status(200).json(
        new ApiResponse(200,{},"the comment is deleted successfully")
    )
})

const getCommentReplies = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }

    const aggregate = Comment.aggregate([
        {
            $match: {
                parentComment: new mongoose.Types.ObjectId(commentId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
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
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
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
        {
            $project: {
                likes: 0
            }
        }
    ]);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: "asc" }, // Replies usually sorted oldest first
        customLabels: {
            docs: "comments",
            totalDocs: "totalComments"
        }
    };

    const replies = await Comment.aggregatePaginate(aggregate, options);

    res.status(200).json(
        new ApiResponse(200, replies, "Replies fetched successfully")
    );
});

const getVideoCommentSentiment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Fetch the 50 most recent comments
    const comments = await Comment.find({ video: videoId })
        .sort({ createdAt: -1 })
        .limit(50)
        .select("content");

    if (!comments || comments.length < 3) {
        return res.status(200).json(
            new ApiResponse(200, { insight: null }, "Not enough comments to generate an AI insight.")
        );
    }

    const commentStrings = comments.map(c => c.content);
    const insight = await generateCommentSentiment(commentStrings);

    if (!insight) {
        throw new ApiError(500, "Failed to generate AI insight");
    }

    return res.status(200).json(
        new ApiResponse(200, { insight }, "Comment sentiment generated successfully")
    );
});

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment,
    getCommentReplies,
    getVideoCommentSentiment
    }
