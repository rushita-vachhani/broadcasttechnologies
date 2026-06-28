import mongoose, {Schema} from "mongoose";
import { User } from "./user.models";

const subscriptionSchema = new mongoose.Schema({
    channel: {type: Schema.Types.ObjectId, ref: User}, 
    subscriber: {type: Schema.Types.ObjectId, ref: User}, //one who is subscribing

},{timestamps: true});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export {Subscription};