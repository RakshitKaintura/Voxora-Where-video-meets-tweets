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

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId}=req.params;
    if(!userId){
        throw new ApiError(400,"User not found");
    }
if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id")
    }
    const tweets= await Tweet.find({owner: userId});
    res.status(200).json(new ApiResponse(200,{tweets},"Tweets are fetched successfully"))
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
    getUserTweets,
    updateTweet,
    deleteTweet
}
