import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        index:true
    },
    job:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Job',
        required:true
    },
    message:{
        type:String,
        required:true
    },
    readAt:{
        type:Date,
        default:null
    }
},{timestamps:true});

notificationSchema.index({ recipient:1, createdAt:-1 });
notificationSchema.index({ recipient:1, job:1 }, { unique:true });

export const Notification = mongoose.model("Notification", notificationSchema);
