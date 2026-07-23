import mongoose, {Schema} from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tweetSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    image: {
        type: String, // Cloudinary URL
        default: null
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    parentTweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet",
        default: null
    }
}, {timestamps: true})

tweetSchema.plugin(mongooseAggregatePaginate);

export const Tweet = mongoose.model("Tweet", tweetSchema)