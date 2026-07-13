import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)){
        throw new ApiError("400","channel id not found");
    }
    const channel=await User.findById(channelId);

    const existingSubscriber=await Subscription.findOne(
        {
            channel:channelId,
            subscriber:req.user._id
        }
    )

    if(existingSubscriber){
        await Subscription.deleteOne(
            {
                channel:channelId,
                subscriber:req.user._id
            }
        )   
    }
    else{
        await Subscription.create(
            {
                channel:channelId,
                subscriber:req.user._id
            }
        )
    }

    const subscriber=await User.findById(req.user._id);
    const isSubscribed=existingSubscriber?false:true;
    const totalSubscribers=await Subscription.countDocuments({
        channel:channelId
    })

    res.status(200).json(
        new ApiResponse(200,{subscriber,isSubscribed,totalSubscribers},"subscription  is toggled successfully ")
    )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "channel id is incorrect");
    }

    const subscribers = await Subscription.find({
        channel: channelId,
        subscriber: {$exists: true}
    }).populate("subscriber", "fullName username avatar");

    const subscribersList = subscribers.map(sub => sub.subscriber);

    res.status(200).json(
        new ApiResponse(200, { subscribers: subscribersList }, "Successfully fetched channel subscribers ")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400, "subscriberId is not correct");
    }

    const subscriber = await User.findById(subscriberId);
    if(!subscriber){
        throw new ApiError(404, "Subscriber not found")
    }

    const subscribedChannels = await Subscription.find({
        subscriber: subscriberId,
        channel: {
            $exists: true
        }
    }).populate("channel", "fullName username avatar");

    const channelList = subscribedChannels.map(sub => sub.channel);

    res.status(200).json(
        new ApiResponse(200, { channels: channelList }, "Successfully fetched subscribed channels ")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}