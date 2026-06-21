import mongoose from "mongoose";

const subTodoschema = new mongoose.Schema({
    content: {type: String, required: true},
    isComplete: {type: Boolean, default: false},
    CreatedBy: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true}
}, {timestamps: true});

export const SubTodo = mongoose.model("SubTodo", subTodoschema);
