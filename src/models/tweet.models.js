import mongoose, {Schema} from "mongoose";

const tweetSchema = new mongoose.Schema({

},
    {
        timestamps: true
    }
);

const Tweet = mongoose.model("Tweet", tweetSchema)

export {Tweet};