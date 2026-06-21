import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
    content:{type: String, required: true},
    isComplete:{type: Boolean, default: false},
    CreatedBy:{type: mongoose.Schema.Types.ObjectId, ref: "User", required: true}, 
    subTodos: [{
        type: mongoose.Schema.Types.ObjectId, ref: "SubTodo"
    }] // array of sub-todo references
}, {timestamps: true});

export const Todo = mongoose.model("Todo", todoSchema);