import mongoose from "mongoose";

const subTodoSchema = new mongoose.Schema({ 
    // username: String,
    // email: String,
    // isActive: Boolean
    username: { type: String, required: true, unique: true, lowercase: true },
    email: { type: String, required: true, lowercase: true },
    isActive: { type: Boolean, default: true },
    password: { type: String, required: true }
},
{ timestamps: true });
export const SubTodo = mongoose.model("SubTodo", subTodoSchema);